/**
 * Encargo orchestration selftest (memory store + mocked LLM).
 */
import {
  createEncargoDraft,
  continueEncargo,
  approveStep,
  rejectStep,
  resetEncargoStoreForTests,
  getEncargoView,
} from "@/core/encargo";
import { setLlmCompleterForTests } from "@/core/tool-registry";
import { bootstrapDeliveryAgents } from "@/core/agent-manager";
import { resetAgentStoreForTests } from "@/core/agent-runtime";
import type { Subject } from "@/core/security";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function admin(): Subject {
  return {
    type: "human",
    id: "admin-test",
    role: "superadmin",
  };
}

async function main() {
  process.env.ALTIVOX_SELFTEST = "1";
  process.env.ALTIVOX_ENCARGO_STORE = "memory";
  process.env.ALTIVOX_AGENT_STORE = "memory";

  resetEncargoStoreForTests();
  resetAgentStoreForTests();

  setLlmCompleterForTests(async ({ prompt }) => ({
    text: `PROPUESTA_TEST: ${String(prompt).slice(0, 120)}`,
    provider: "test",
  }));

  const a = admin();
  await bootstrapDeliveryAgents(a);

  const draft = await createEncargoDraft(a, {
    clientId: "11111111-1111-1111-1111-111111111111",
    clientName: "Cliente Demo",
    serviceKey: "web",
    description: "Necesito una landing moderna para clínica dental con CTA.",
  });
  assert(draft.encargo.status === "draft", "draft status");
  assert(draft.steps.length === 0, "no steps before continue");

  let view = await continueEncargo(a, draft.encargo.id);
  assert(view.steps.length === 4, "four steps");
  assert(view.steps[0].status === "proposed", "first proposed");
  assert(view.steps[0].proposal.includes("PROPUESTA"), "proposal text");
  assert(view.encargo.status === "awaiting_approval", "awaiting human");

  view = await rejectStep(a, view.encargo.id, view.steps[0].id);
  assert(view.steps[0].status === "rejected", "rejected");

  view = await continueEncargo(a, view.encargo.id);
  assert(view.steps[0].status === "proposed", "re-proposed");

  view = await approveStep(a, view.encargo.id, view.steps[0].id);
  assert(view.steps[0].status === "done", "first done after OK");
  assert(view.steps[1].status === "proposed", "second auto-proposed");

  // Approve through design + code to verify code artifact is previewable
  view = await approveStep(a, view.encargo.id, view.steps[1].id);
  assert(view.steps[1].status === "done", "design done");
  view = await approveStep(a, view.encargo.id, view.steps[2].id);
  assert(view.steps[2].status === "done", "code done");
  const { extractPrimaryArtifact } = await import("./artifacts");
  const art = extractPrimaryArtifact(
    view.steps[2].output,
    view.encargo.serviceKey,
    view.encargo.clientName
  );
  assert(art && art.kind === "html", "code output yields html artifact");
  assert(art.content.includes("<html"), "html document present");

  const again = await getEncargoView(a, view.encargo.id);
  assert(again.steps[0].output.length > 0, "output stored");

  // Local artifact builder for chatbot
  const { buildLocalImplementation } = await import("./local-artifact");
  const localChat = buildLocalImplementation({
    role: "code",
    serviceKey: "chatbot",
    clientName: "Lucia",
    description: "Chatbot LuBot interfaz blanca bordes cian botón flotante",
    proposal: "widget",
  });
  const chatArt = extractPrimaryArtifact(localChat, "chatbot", "Lucia");
  assert(chatArt?.kind === "html", "chatbot local html");
  assert(chatArt.content.includes("LuBot") || chatArt.content.includes("chat"), "chatbot widget");

  const localMustang = buildLocalImplementation({
    role: "code",
    serviceKey: "web",
    clientName: "Xabier",
    description:
      "Landing Mustang GT 1990 modelación 3d animación scroll puertas interior luna capó motor",
    proposal: "cinematic",
  });
  const mustangArt = extractPrimaryArtifact(localMustang, "web", "Xabier");
  assert(mustangArt?.kind === "html", "mustang local html");
  assert(
    mustangArt.content.includes("GLTFLoader") &&
      mustangArt.content.includes("mustang.glb"),
    "gltf mustang landing"
  );
  assert(
    mustangArt.content.includes("DoorLPivot") &&
      mustangArt.content.includes("HoodPivot") &&
      mustangArt.content.includes("DoorRPivot"),
    "mustang door/hood pivots"
  );
  assert(
    /puertas|interior|luna|cap[oó]|motor/i.test(mustangArt.content),
    "mustang brief sequence copy"
  );

  setLlmCompleterForTests(null);
  console.log("encargo.selftest: ok");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
