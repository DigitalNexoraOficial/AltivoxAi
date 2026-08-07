/**
 * Bloque 7 · Deploy Engine self-tests (ADR-017).
 * Run: ALTIVOX_SELFTEST=1 npx --yes tsx src/core/deploy-engine/deploy-engine.selftest.ts
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { can, type HumanSubject, type MachineSubject } from "@/core/security";
import { executeIntention, jarvisMachineSubject } from "@/core/jarvis";
import {
  cancelDeployment,
  createDeployment,
  DeployError,
  executeDeployment,
  getDeployment,
  getMemoryPackage,
  resetDeployStoreForTests,
  resetPackageStoreForTests,
  setProjectGateForTests,
} from "./index";
import { buildDeploymentZip } from "./internal/zip-builder";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

function admin(): HumanSubject {
  return { type: "human", id: "u-admin", role: "admin" };
}

function viewer(): HumanSubject {
  return { type: "human", id: "u-viewer", role: "viewer" };
}

const PROJECT_ID = "11111111-1111-4111-8111-111111111111";
const VERSION_ID = "22222222-2222-4222-8222-222222222222";

async function expectDeployError(
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
    threw instanceof DeployError && threw.code === code,
    `expected DeployError ${code}, got ${String(threw)}`
  );
}

async function main() {
  process.env.ALTIVOX_SELFTEST = "1";
  resetDeployStoreForTests();
  resetPackageStoreForTests();
  setProjectGateForTests(async (_s, projectId) => {
    if (projectId !== PROJECT_ID) {
      throw new DeployError("not_found", "project_not_found", 404);
    }
    return { id: projectId, name: "Demo", status: "approved" };
  });

  assert(can(admin(), "deploy.create").allowed, "admin create");
  assert(can(admin(), "deploy.execute").allowed, "admin execute");
  assert(can(admin(), "deploy.cancel").allowed, "admin cancel");
  assert(can(admin(), "deploy.configure").allowed, "admin configure");
  assert(!can(viewer(), "deploy.create").allowed, "viewer deny create");

  await expectDeployError(
    () =>
      createDeployment(viewer(), {
        projectId: PROJECT_ID,
        versionId: VERSION_ID,
      }),
    "forbidden"
  );

  const created = await createDeployment(admin(), {
    projectId: PROJECT_ID,
    versionId: VERSION_ID,
    deliverables: [
      {
        deliverableId: "d1",
        title: "Home",
        kind: "preview",
        uri: "https://example.com/a",
        content: '{"ok":true}',
      },
    ],
  });
  assert(created.deployment.status === "draft", "initial draft");
  assert(
    created.events.some((e) => e.event === "deployment.created"),
    "created event"
  );

  const executed = await executeDeployment(admin(), created.deployment.id);
  assert(executed.deployment.status === "packaged", "execute → packaged");
  assert(executed.deployment.packageUri, "package uri set");
  assert(
    executed.events.some((e) => e.event === "deployment.queued"),
    "queued event"
  );
  assert(
    executed.events.some((e) => e.event === "deployment.building"),
    "building event"
  );
  assert(
    executed.events.some((e) => e.event === "deployment.packaged"),
    "packaged event"
  );

  const blob = getMemoryPackage(executed.deployment.packageUri!);
  assert(!!blob && blob.length > 0, "zip bytes in memory store");
  assert(blob![0] === 0x50 && blob![1] === 0x4b, "ZIP magic PK");

  // Reproducible ZIP
  const z1 = buildDeploymentZip({
    deploymentId: "same-id",
    projectId: PROJECT_ID,
    versionId: VERSION_ID,
    deliverables: [
      { deliverableId: "d1", title: "Home", kind: "preview", uri: null },
    ],
  });
  const z2 = buildDeploymentZip({
    deploymentId: "same-id",
    projectId: PROJECT_ID,
    versionId: VERSION_ID,
    deliverables: [
      { deliverableId: "d1", title: "Home", kind: "preview", uri: null },
    ],
  });
  assert(z1.sha256Hex === z2.sha256Hex, "zip reproducible");

  // Cancel path
  const c = await createDeployment(admin(), {
    projectId: PROJECT_ID,
    versionId: VERSION_ID,
  });
  const cancelled = await cancelDeployment(admin(), c.deployment.id);
  assert(cancelled.deployment.status === "cancelled", "cancelled");
  await expectDeployError(
    () => executeDeployment(admin(), c.deployment.id),
    "invalid_transition"
  );

  // Controlled error: missing project
  await expectDeployError(
    () =>
      createDeployment(admin(), {
        projectId: "00000000-0000-4000-8000-000000000099",
        versionId: VERSION_ID,
      }),
    "not_found"
  );

  // JARVIS create + execute
  const jarvis = jarvisMachineSubject();
  assert(can(jarvis, "deploy.create").allowed, "jarvis create");
  assert(can(jarvis, "deploy.execute").allowed, "jarvis execute");
  assert(!can(jarvis, "deploy.configure").allowed, "jarvis no configure");
  const viaJ = (await executeIntention(jarvis, {
    op: "deploy.create",
    input: {
      projectId: PROJECT_ID,
      versionId: VERSION_ID,
      deliverables: [
        { deliverableId: "d2", title: "Docs", kind: "doc", uri: null },
      ],
    },
  })) as Awaited<ReturnType<typeof createDeployment>>;
  const viaExec = (await executeIntention(jarvis, {
    op: "deploy.execute",
    deploymentId: viaJ.deployment.id,
  })) as Awaited<ReturnType<typeof executeDeployment>>;
  assert(viaExec.deployment.status === "packaged", "jarvis packaged");

  const agent: MachineSubject = {
    type: "machine",
    id: "agent:x",
    principalType: "agent",
  };
  assert(!can(agent, "deploy.create").allowed, "agent no deploy");

  // getDeployment
  const got = await getDeployment(admin(), viaExec.deployment.id);
  assert(got.deployment.id === viaExec.deployment.id, "get ok");

  // Source isolation
  const root = dirname(fileURLToPath(import.meta.url));
  const files = readdirSync(root, { recursive: true }) as string[];
  for (const f of files) {
    if (!String(f).endsWith(".ts")) continue;
    if (String(f).includes("selftest")) continue;
    if (String(f).includes("project-gate")) continue;
    const src = readFileSync(join(root, String(f)), "utf8");
    assert(!src.includes("agent-runtime"), `${f}: no agent-runtime`);
    assert(!src.includes("review-engine"), `${f}: no review-engine`);
    assert(!src.includes("workflow-engine"), `${f}: no workflow`);
    assert(!src.includes("project-engine/internal"), `${f}: no PE internal`);
    assert(!/vercel|netlify|ftp|github\.com\/.*deploy/i.test(src), `${f}: no vendors`);
  }
  const uc = readFileSync(join(root, "use-cases.ts"), "utf8");
  assert(!uc.includes("transitionProject"), "no PE transition");
  assert(!uc.includes("/api/review"), "no review api");
  assert(!uc.includes("src/app/r"), "no review portal");

  const gateSrc = readFileSync(join(root, "internal/project-gate.ts"), "utf8");
  assert(gateSrc.includes('@/core/project-engine"'), "gate PE public");
  assert(!gateSrc.includes("project-engine/internal"), "gate no PE internal");

  console.log("deploy-engine.selftest: ok");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
