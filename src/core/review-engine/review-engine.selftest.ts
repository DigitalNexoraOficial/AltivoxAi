/**
 * Bloque 6 · Review Engine self-tests (ADR-016).
 * Run: ALTIVOX_SELFTEST=1 npx --yes tsx src/core/review-engine/review-engine.selftest.ts
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { can, type HumanSubject, type MachineSubject } from "@/core/security";
import { executeIntention, jarvisMachineSubject } from "@/core/jarvis";
import {
  approveReview,
  commentOnReview,
  createReview,
  getReviewByToken,
  rejectReview,
  requestChangesOnReview,
  resetReviewStoreForTests,
  revokeReview,
  setProjectGateForTests,
  ReviewError,
} from "./index";
import { hashReviewToken, generateReviewTokenPlaintext } from "./internal/token";
import {
  createMemoryReviewStore,
  getReviewStore,
  setReviewStoreForTests,
} from "./internal/store";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function admin(): HumanSubject {
  return { type: "human", id: "u-admin", role: "admin" };
}

function viewer(): HumanSubject {
  return { type: "human", id: "u-viewer", role: "viewer" };
}

function operator(): HumanSubject {
  return { type: "human", id: "u-op", role: "operator" };
}

const PROJECT_ID = "11111111-1111-4111-8111-111111111111";
const VERSION_ID = "22222222-2222-4222-8222-222222222222";

function deliverables() {
  return [
    {
      deliverableId: "d1",
      title: "Home mock",
      kind: "preview",
      uri: "https://example.com/preview",
      metadata: { agentId: "should-strip", ok: true },
    },
  ];
}

async function expectReviewError(
  fn: () => Promise<unknown>,
  code: string
): Promise<void> {
  let threw: unknown;
  try {
    await fn();
  } catch (e) {
    threw = e;
  }
  assert(
    threw instanceof ReviewError && threw.code === code,
    `expected ReviewError ${code}, got ${String(threw)}`
  );
}

async function main() {
  process.env.ALTIVOX_SELFTEST = "1";
  resetReviewStoreForTests();
  setProjectGateForTests(async (_s, projectId) => {
    if (projectId !== PROJECT_ID) {
      throw new ReviewError("not_found", "project_not_found", 404);
    }
    return { id: projectId, name: "Demo", status: "review" };
  });

  // --- Authz create / revoke ---
  assert(can(admin(), "review.create").allowed, "admin create");
  assert(can(admin(), "review.revoke").allowed, "admin revoke");
  assert(can(operator(), "review.create").allowed, "operator create");
  assert(!can(operator(), "review.revoke").allowed, "operator no revoke");
  assert(!can(viewer(), "review.create").allowed, "viewer no create");

  await expectReviewError(
    () =>
      createReview(viewer(), {
        projectId: PROJECT_ID,
        versionId: VERSION_ID,
        deliverables: deliverables(),
      }),
    "forbidden"
  );

  const created = await createReview(admin(), {
    projectId: PROJECT_ID,
    versionId: VERSION_ID,
    deliverables: deliverables(),
  });
  assert(created.review.status === "sent", "created → sent");
  assert(typeof created.token === "string" && created.token.length > 20, "token once");
  assert(created.portalPath?.startsWith("/r/"), "portal path");
  assert(
    !JSON.stringify(created.deliverables[0].metadata).includes("agentId"),
    "agent metadata stripped on normalize"
  );

  const token = created.token!;
  const reviewId = created.review.id;

  // Token hash never equals plaintext
  assert(hashReviewToken(token) !== token, "hash ≠ plaintext");
  assert(generateReviewTokenPlaintext().length > 20, "entropy");

  // --- Client get → viewed ---
  const view1 = await getReviewByToken(token);
  assert(view1.status === "viewed", "first open → viewed");
  assert(view1.deliverables.length === 1, "allowlist only");
  assert(view1.deliverables[0].title === "Home mock", "snapshot title");
  assert(
    !("agentId" in (view1.deliverables[0].metadata || {})),
    "no agent metadata in client view"
  );
  assert(!("token" in view1), "no token field in client view");

  // Invalid / expired / revoked tokens
  await expectReviewError(() => getReviewByToken("not-a-real-token"), "invalid_token");

  const expired = await createReview(admin(), {
    projectId: PROJECT_ID,
    versionId: VERSION_ID,
    deliverables: deliverables(),
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  });
  // Force expiry by creating with past date should fail input
  await expectReviewError(
    () =>
      createReview(admin(), {
        projectId: PROJECT_ID,
        versionId: VERSION_ID,
        deliverables: deliverables(),
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      }),
    "invalid_input"
  );

  // Comment + changes + approve path on fresh review
  const r2 = await createReview(admin(), {
    projectId: PROJECT_ID,
    versionId: VERSION_ID,
    deliverables: deliverables(),
  });
  const t2 = r2.token!;
  const afterComment = await commentOnReview(t2, "Necesito ajuste en hero");
  assert(afterComment.comments.length === 1, "comment stored");
  const afterChanges = await requestChangesOnReview(t2);
  assert(afterChanges.status === "changes_requested", "changes_requested");

  const r3 = await createReview(admin(), {
    projectId: PROJECT_ID,
    versionId: VERSION_ID,
    deliverables: deliverables(),
  });
  const approved = await approveReview(r3.token!);
  assert(approved.status === "approved", "approved");
  // PE not mutated — we only assert Review state (no transitionProject call in source)

  const r4 = await createReview(admin(), {
    projectId: PROJECT_ID,
    versionId: VERSION_ID,
    deliverables: deliverables(),
  });
  const rejected = await rejectReview(r4.token!);
  assert(rejected.status === "rejected", "rejected");

  // Revoke
  const r5 = await createReview(admin(), {
    projectId: PROJECT_ID,
    versionId: VERSION_ID,
    deliverables: deliverables(),
  });
  const t5 = r5.token!;
  await expectReviewError(() => revokeReview(operator(), r5.review.id), "forbidden");
  const revoked = await revokeReview(admin(), r5.review.id);
  assert(revoked.review.status === "revoked", "revoked status");
  await expectReviewError(() => getReviewByToken(t5), "token_revoked");

  // Expired simulation via injected memory store
  const mem = createMemoryReviewStore();
  setReviewStoreForTests(mem);
  const plaintext = generateReviewTokenPlaintext();
  const hash = hashReviewToken(plaintext);
  const expiredAt = new Date(Date.now() - 60_000).toISOString();
  await mem.createReview({
    projectId: PROJECT_ID,
    versionId: VERSION_ID,
    status: "sent",
    expiresAt: expiredAt,
    deliverables: deliverables(),
    tokenHash: hash,
    actor: { actorType: "human", actorId: "u-admin" },
  });
  await expectReviewError(() => getReviewByToken(plaintext), "token_expired");
  setReviewStoreForTests(null);
  resetReviewStoreForTests();
  setProjectGateForTests(async (_s, projectId) => ({
    id: projectId,
    name: "Demo",
    status: "review",
  }));

  // --- JARVIS create / revoke ---
  const jarvis = jarvisMachineSubject();
  assert(can(jarvis, "review.create").allowed, "jarvis create");
  assert(can(jarvis, "review.revoke").allowed, "jarvis revoke");
  const viaJarvis = (await executeIntention(jarvis, {
    op: "review.create",
    input: {
      projectId: PROJECT_ID,
      versionId: VERSION_ID,
      deliverables: deliverables(),
    },
  })) as Awaited<ReturnType<typeof createReview>>;
  assert(viaJarvis.review.status === "sent", "jarvis created review");
  const viaRevoke = (await executeIntention(jarvis, {
    op: "review.revoke",
    reviewId: viaJarvis.review.id,
  })) as Awaited<ReturnType<typeof revokeReview>>;
  assert(viaRevoke.review.status === "revoked", "jarvis revoked");

  // Agent machine cannot create review
  const agent: MachineSubject = {
    type: "machine",
    id: "agent:x",
    principalType: "agent",
  };
  assert(!can(agent, "review.create").allowed, "agent no review.create");

  // --- Source isolation ---
  const root = dirname(fileURLToPath(import.meta.url));
  const files = readdirSync(root, { recursive: true }) as string[];
  for (const f of files) {
    if (!String(f).endsWith(".ts")) continue;
    if (String(f).includes("selftest")) continue;
    if (String(f).includes("project-gate")) continue; // may import PE public only
    const src = readFileSync(join(root, String(f)), "utf8");
    assert(!src.includes("agent-runtime"), `${f}: no agent-runtime`);
    assert(!src.includes("tool-registry"), `${f}: no tool-registry`);
    assert(!src.includes("memory-engine"), `${f}: no memory-engine`);
    assert(!src.includes("Deployment"), `${f}: no deploy`);
    assert(!src.includes("project-engine/internal"), `${f}: no PE internal`);
  }
  // use-cases must not call transitionProject
  const uc = readFileSync(join(root, "use-cases.ts"), "utf8");
  assert(!uc.includes("transitionProject"), "no PE transition from Review");
  assert(uc.includes("getProjectGate"), "uses PE gate");

  // project-gate only imports public PE
  const gateSrc = readFileSync(join(root, "internal/project-gate.ts"), "utf8");
  assert(gateSrc.includes('@/core/project-engine"'), "gate uses PE barrel");
  assert(!gateSrc.includes("project-engine/internal"), "gate no PE internal");

  void getReviewStore;
  void expired;
  void reviewId;

  console.log("review-engine.selftest: ok");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
