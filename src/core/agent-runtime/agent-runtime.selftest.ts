/**
 * Bloque 5 Agent Runtime self-tests (ADR-015).
 * Run: ALTIVOX_SELFTEST=1 npx --yes tsx src/core/agent-runtime/agent-runtime.selftest.ts
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AgentError,
  canTransitionRun,
  cancelAgentRun,
  createAgentRun,
  executeAgentRun,
  resetAgentStoreForTests,
} from "./index";
import {
  registerAgent,
  validateManifest,
  bootstrapWebAgents,
  resolveAgentsByCapability,
} from "@/core/agent-manager";
import { resolveCapability } from "@/core/capability-registry";
import {
  completeLlm,
  assertToolAllowed,
  setLlmCompleterForTests,
} from "@/core/tool-registry";
import { appendRunFact, listRunFacts } from "@/core/memory-engine";
import {
  executeIntention,
  jarvisMachineSubject,
} from "@/core/jarvis";
import { can, type HumanSubject } from "@/core/security";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

async function main() {
  process.env.ALTIVOX_SELFTEST = "1";
  resetAgentStoreForTests();
  setLlmCompleterForTests(async (input) => ({
    text: `ok:${input.prompt.slice(0, 40)}`,
    provider: "test",
  }));

  assert(canTransitionRun("queued", "running"), "queued→running");
  assert(canTransitionRun("running", "completed"), "running→completed");
  assert(canTransitionRun("running", "cancelled"), "running→cancelled");
  assert(!canTransitionRun("completed", "running"), "no restart");

  const admin: HumanSubject = { type: "human", id: "a1", role: "admin" };
  const operator: HumanSubject = { type: "human", id: "o1", role: "operator" };
  const viewer: HumanSubject = { type: "human", id: "v1", role: "viewer" };
  const jarvis = jarvisMachineSubject();

  // Invalid manifest
  // Invalid manifest
  let threw: unknown;
  try {
    validateManifest({ id: "bad.mod", name: "n", moduleId: "nope", capabilities: ["c"] });
    assert(false, "should reject unknown module");
  } catch (e) {
    threw = e;
  }
  assert(
    threw instanceof AgentError && String((threw as AgentError).message).includes("unknown_module"),
    "reject unknown module"
  );

  try {
    validateManifest({
      id: "bad.tool",
      name: "n",
      moduleId: "web",
      capabilities: ["web.frontend"],
      tools: ["github.push"],
    });
    assert(false, "should reject bad tool");
  } catch (e) {
    assert(e instanceof AgentError, "tool_not_allowed");
  }

  // Bootstrap web agents (admin configure)
  const registered = await bootstrapWebAgents(admin);
  assert(registered.length === 2, "two web agents");

  // Capability resolve
  const ids = await resolveCapability(operator, "web.frontend");
  assert(ids.includes("web.frontend"), "resolve capability");
  const resolved = await resolveAgentsByCapability(operator, "web.qa");
  assert(resolved.some((a) => a.id === "web.qa"), "resolve agents by capability");

  // 1. Create run authorized
  const run = await createAgentRun(operator, {
    agentId: "web.frontend",
    input: { prompt: "Diseña un hero" },
  });
  assert(run.status === "queued", "run queued");

  // 2. Deny viewer
  threw = undefined;
  try {
    await createAgentRun(viewer, { agentId: "web.frontend" });
  } catch (e) {
    threw = e;
  }
  assert(threw instanceof AgentError && threw.code === "forbidden", "viewer deny");

  // 3. Deny empty subject via jarvis path
  threw = undefined;
  try {
    await executeIntention(null, {
      op: "agent.run.create",
      input: { agentId: "web.frontend" },
    });
  } catch (e) {
    threw = e;
  }
  assert(threw && (threw as { code?: string }).code === "invalid_subject", "null subject");

  // 4. Execute registered agent
  const done = await executeAgentRun(operator, run.id);
  assert(done.status === "completed", "run completed");
  assert(done.result && typeof (done.result as { text?: string }).text === "string", "has result");

  // Memory
  const facts = await listRunFacts(operator, run.id);
  assert(facts.some((f) => f.kind === "run.started"), "fact started");
  assert(facts.some((f) => f.kind === "tool.llm.complete"), "fact llm");
  assert(facts.some((f) => f.kind === "run.completed"), "fact completed");

  // 5. Cancel authorized
  const run2 = await createAgentRun(operator, {
    agentId: "web.qa",
    input: { prompt: "checklist" },
  });
  const cancelled = await cancelAgentRun(operator, run2.id);
  assert(cancelled.status === "cancelled", "cancelled");

  // Tool allow / deny
  assertToolAllowed("llm.complete");
  threw = undefined;
  try {
    assertToolAllowed("deploy.vercel");
  } catch (e) {
    threw = e;
  }
  assert(threw instanceof AgentError && threw.code === "tool_denied", "block bad tool");

  const llm = await completeLlm(
    { type: "machine", id: "agent:x", principalType: "agent", allowlist: ["tool.execute"] },
    { prompt: "hola" }
  );
  assert(llm.provider === "test", "llm via registry");

  // viewer cannot tool.execute
  threw = undefined;
  try {
    await completeLlm(viewer, { prompt: "x" });
  } catch (e) {
    threw = e;
  }
  assert(threw instanceof AgentError && threw.code === "forbidden", "viewer tool deny");

  // Memory append deny for viewer
  threw = undefined;
  try {
    await appendRunFact(viewer, run.id, "x", {});
  } catch (e) {
    threw = e;
  }
  assert(threw instanceof AgentError && threw.code === "forbidden", "viewer memory deny");

  // 11. JARVIS → Agent Runtime
  assert(can(jarvis, "agent.execute").allowed, "jarvis may execute");
  // jarvis cannot configure — use admin via intention register already done
  const jRun = (await executeIntention(jarvis, {
    op: "agent.run.create",
    input: { agentId: "web.frontend", input: { prompt: "via jarvis" } },
  })) as { id: string; status: string };
  assert(jRun.status === "queued", "jarvis created run");
  const jDone = (await executeIntention(jarvis, {
    op: "agent.run.execute",
    runId: jRun.id,
  })) as { status: string };
  assert(jDone.status === "completed", "jarvis executed run");

  // 12. JARVIS source must not call completeLlm / openrouter
  const here = dirname(fileURLToPath(import.meta.url));
  const jarvisCaller = readFileSync(
    join(here, "../jarvis/caller.ts"),
    "utf8"
  );
  assert(!jarvisCaller.includes("completeLlm"), "jarvis no completeLlm");
  assert(!jarvisCaller.includes("OPENROUTER"), "jarvis no openrouter");
  assert(!jarvisCaller.includes("tool-registry"), "jarvis no tool-registry import");
  assert(jarvisCaller.includes("executeAgentRun"), "jarvis delegates execute");

  // 13. No Review/Deploy/Workflow runtime imports in agent-runtime use-cases
  const uc = readFileSync(join(here, "use-cases.ts"), "utf8");
  assert(!uc.includes("workflow-engine"), "no workflow import");
  assert(!uc.includes("review"), "no review");
  assert(!uc.includes("deploy"), "no deploy");

  // 14. PE public API still importable / untouched pattern
  const { createProject } = await import("@/core/project-engine");
  assert(typeof createProject === "function", "PE intact export");

  // registerAgent deny operator (no configure)
  threw = undefined;
  try {
    await registerAgent(operator, {
      id: "web.extra",
      name: "Extra",
      moduleId: "web",
      capabilities: ["web.frontend"],
      tools: ["llm.complete"],
      prompt: "x",
      enabled: true,
    });
  } catch (e) {
    threw = e;
  }
  assert(
    threw instanceof AgentError && threw.code === "forbidden",
    "operator cannot configure"
  );

  setLlmCompleterForTests(null);
  console.log("agent-runtime.selftest: ok");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
