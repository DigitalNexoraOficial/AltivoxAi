/**
 * Bloque 4 JARVIS Core self-tests.
 * Run: npx --yes tsx src/core/jarvis/jarvis.selftest.ts
 *
 * Does not hit Supabase — forbidden paths fail at can() inside PE use-cases
 * before repository I/O. Success-path PE I/O is out of scope for this unit selftest.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ProjectEngineError } from "@/core/project-engine";
import { can, type HumanSubject, type MachineSubject } from "@/core/security";
import {
  executeIntention,
  jarvisMachineSubject,
  JarvisError,
} from "./index";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const jarvis = jarvisMachineSubject();
  assert(jarvis.type === "machine", "jarvis is machine subject");
  assert(
    jarvis.type === "machine" && jarvis.principalType === "jarvis",
    "principalType jarvis"
  );

  // 1. JARVIS is a valid caller (ceiling allows PE ops; orchestrator is wired)
  assert(can(jarvis, "project.create").allowed, "jarvis may project.create");
  assert(can(jarvis, "project.read").allowed, "jarvis may project.read");
  assert(can(jarvis, "project.update").allowed, "jarvis may project.update");
  assert(
    can(jarvis, "project.transition").allowed,
    "jarvis may project.transition"
  );
  assert(can(jarvis, "project.approve").allowed, "jarvis may project.approve");
  assert(
    can(jarvis, "deliverable.generate").allowed,
    "jarvis may deliverable.generate"
  );
  assert(typeof executeIntention === "function", "executeIntention exported");

  // 2. JARVIS cannot exceed ceiling
  assert(!can(jarvis, "role.manage").allowed, "jarvis deny role.manage");
  assert(
    !can(jarvis, "deploy.production").allowed,
    "jarvis deny deploy.production"
  );
  assert(!can(jarvis, "settings.write").allowed, "jarvis deny settings.write");

  // 3. Invalid calls fail closed
  let threw: unknown;
  try {
    await executeIntention(null, {
      op: "project.create",
      input: { name: "x", serviceType: "web" },
    });
  } catch (e) {
    threw = e;
  }
  assert(
    threw instanceof JarvisError && threw.code === "invalid_subject",
    "null subject → JarvisError"
  );

  threw = undefined;
  try {
    await executeIntention(jarvis, {
      // @ts-expect-error intentional invalid op for runtime fail-closed
      op: "agent.run",
    });
  } catch (e) {
    threw = e;
  }
  assert(
    threw instanceof JarvisError && threw.code === "invalid_intention",
    "unknown intention → JarvisError"
  );

  const viewer: HumanSubject = { type: "human", id: "v1", role: "viewer" };
  threw = undefined;
  try {
    await executeIntention(viewer, {
      op: "project.create",
      input: { name: "Nope", serviceType: "web" },
    });
  } catch (e) {
    threw = e;
  }
  assert(
    threw instanceof ProjectEngineError && threw.code === "forbidden",
    "viewer create via JARVIS → PE forbidden (can() inside use-case)"
  );

  // 4. JARVIS does not mutate domain outside use-cases (no internal/repo imports)
  const here = dirname(fileURLToPath(import.meta.url));
  const callerSrc = readFileSync(join(here, "caller.ts"), "utf8");
  assert(
    !callerSrc.includes("project-engine/internal"),
    "caller must not import PE internal"
  );
  assert(!callerSrc.includes("service_role"), "no service_role in caller");
  assert(!callerSrc.includes("createClient"), "no supabase client in caller");
  assert(
    callerSrc.includes("@/core/project-engine"),
    "caller uses public PE surface"
  );

  const agentLike: MachineSubject = {
    type: "machine",
    id: "agent:1",
    principalType: "agent",
  };
  assert(
    !can(agentLike, "project.create").allowed,
    "agent ceiling ≠ jarvis (sanity)"
  );

  console.log("jarvis.selftest: ok");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
