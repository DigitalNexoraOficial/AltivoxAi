/**
 * Encargo orchestration use-cases.
 * Human OK required before any step implementation (approve gate).
 */

import { can, type Subject } from "@/core/security";
import { createProject } from "@/core/project-engine";
import {
  bootstrapDeliveryAgents,
  getAgent,
} from "@/core/agent-manager";
import { AgentError } from "@/core/agent-runtime/errors";
import { createAgentRun, executeAgentRun } from "@/core/agent-runtime";
import { completeLlm } from "@/core/tool-registry";
import { EncargoError } from "./errors";
import { getEncargoStore } from "./internal/store";
import {
  isEncargoServiceKey,
  type EncargoServiceKey,
  type EncargoView,
} from "./types";

function assertCan(subject: Subject, action: string): void {
  const d = can(subject, action);
  if (!d.allowed) throw new EncargoError("forbidden", d.reason, 403);
}

async function toView(encargoId: string): Promise<EncargoView> {
  const store = getEncargoStore();
  const encargo = await store.getEncargo(encargoId);
  if (!encargo) throw new EncargoError("not_found", "encargo_not_found", 404);
  const steps = await store.listSteps(encargoId);
  return { encargo, steps };
}

async function ensureDeliveryAgents(subject: Subject): Promise<void> {
  const roles = ["reasoning", "design", "code", "qa"] as const;
  let missing = false;
  for (const role of roles) {
    const id = `delivery.${role}`;
    try {
      await getAgent(subject, id);
    } catch (err) {
      if (err instanceof AgentError && err.code === "not_found") {
        missing = true;
        break;
      }
      throw err;
    }
  }
  if (!missing) return;
  if (!can(subject, "agent.configure").allowed) {
    throw new EncargoError(
      "forbidden",
      "agents_not_bootstrapped_need_admin",
      403
    );
  }
  await bootstrapDeliveryAgents(subject);
}

function proposalPrompt(
  role: string,
  serviceKey: string,
  description: string,
  prior: string
): string {
  return [
    `MODO: SOLO PROPUESTA. No implementes ni digas que ya está hecho.`,
    `Rol: ${role}`,
    `Servicio: ${serviceKey}`,
    `Brief del cliente/operador:`,
    description.slice(0, 6000),
    prior ? `Contexto de pasos previos:\n${prior.slice(0, 4000)}` : "",
    `Devuelve una propuesta clara en español: objetivos, enfoque, artefactos previstos y riesgos.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function implementPrompt(
  role: string,
  serviceKey: string,
  description: string,
  proposal: string,
  prior: string
): string {
  return [
    `MODO: IMPLEMENTACIÓN AUTORIZADA por el operador humano.`,
    `Rol: ${role}`,
    `Servicio: ${serviceKey}`,
    `Brief:`,
    description.slice(0, 6000),
    `Propuesta aprobada:`,
    proposal.slice(0, 4000),
    prior ? `Salidas previas:\n${prior.slice(0, 4000)}` : "",
    role === "code"
      ? `Genera el código principal (completo o por archivos) alineado al brief.`
      : `Ejecuta tu especialidad y entrega el resultado final estructurado.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function createEncargoDraft(
  subject: Subject,
  input: {
    clientId: string;
    clientName: string;
    leadId?: string | null;
    serviceKey: string;
    description: string;
  }
): Promise<EncargoView> {
  assertCan(subject, "project.create");
  const clientId = String(input.clientId || "").trim();
  const clientName = String(input.clientName || "").trim();
  const description = String(input.description || "").trim();
  const serviceKey = String(input.serviceKey || "").trim();
  if (!clientId) throw new EncargoError("invalid_input", "client_id_required");
  if (!clientName) throw new EncargoError("invalid_input", "client_name_required");
  if (!description) throw new EncargoError("invalid_input", "description_required");
  if (!isEncargoServiceKey(serviceKey)) {
    throw new EncargoError("invalid_input", "service_key_invalid");
  }

  const store = getEncargoStore();
  const encargo = await store.createEncargo({
    clientId,
    clientName,
    leadId: input.leadId ? String(input.leadId) : null,
    serviceKey: serviceKey as EncargoServiceKey,
    description,
    actorId: subject.id,
  });
  return { encargo, steps: [] };
}

export async function continueEncargo(
  subject: Subject,
  encargoId: string
): Promise<EncargoView> {
  assertCan(subject, "project.create");
  assertCan(subject, "agent.execute");
  const store = getEncargoStore();
  let encargo = await store.getEncargo(encargoId);
  if (!encargo) throw new EncargoError("not_found", "encargo_not_found", 404);
  if (!encargo.description.trim()) {
    throw new EncargoError("invalid_input", "description_required");
  }
  if (!isEncargoServiceKey(encargo.serviceKey)) {
    throw new EncargoError("invalid_input", "service_key_invalid");
  }

  await ensureDeliveryAgents(subject);

  if (!encargo.projectId) {
    if (process.env.ALTIVOX_SELFTEST === "1") {
      encargo = await store.updateEncargo(encargo.id, {
        projectId: "00000000-0000-4000-8000-000000000099",
        status: "ready",
      });
    } else {
      const project = await createProject(subject, {
        name: `${encargo.clientName} · ${encargo.serviceLabel}`,
        serviceType: encargo.serviceKey,
        description: encargo.description,
        clientId: encargo.clientId,
        leadId: encargo.leadId,
      });
      encargo = await store.updateEncargo(encargo.id, {
        projectId: project.id,
        status: "ready",
      });
    }
  }

  let steps = await store.listSteps(encargo.id);
  if (steps.length === 0) {
    steps = await store.seedSteps(encargo.id);
  }

  // First pending step → propose (no implementation without OK)
  const next = steps.find((s) => s.status === "pending" || s.status === "rejected");
  if (next) {
    await proposeStep(subject, encargo.id, next.id);
  } else if (steps.every((s) => s.status === "done")) {
    await store.updateEncargo(encargo.id, { status: "completed" });
  } else {
    await store.updateEncargo(encargo.id, { status: "awaiting_approval" });
  }

  return toView(encargo.id);
}

export async function getEncargoView(
  subject: Subject,
  encargoId: string
): Promise<EncargoView> {
  if (!can(subject, "project.read").allowed) {
    throw new EncargoError("forbidden", "encargo_read_denied", 403);
  }
  return toView(encargoId);
}

export async function listEncargos(
  subject: Subject
): Promise<EncargoView["encargo"][]> {
  if (!can(subject, "project.read").allowed) {
    throw new EncargoError("forbidden", "encargo_list_denied", 403);
  }
  return getEncargoStore().listEncargos();
}

export async function proposeStep(
  subject: Subject,
  encargoId: string,
  stepId: string
): Promise<EncargoView> {
  assertCan(subject, "agent.execute");
  const store = getEncargoStore();
  const encargo = await store.getEncargo(encargoId);
  if (!encargo) throw new EncargoError("not_found", "encargo_not_found", 404);
  const step = await store.getStep(stepId);
  if (!step || step.encargoId !== encargoId) {
    throw new EncargoError("not_found", "step_not_found", 404);
  }
  if (step.status === "done" || step.status === "running") {
    throw new EncargoError("conflict", `cannot_propose:${step.status}`);
  }

  const steps = await store.listSteps(encargoId);
  const prior = steps
    .filter((s) => s.sortOrder < step.sortOrder && s.output)
    .map((s) => `[${s.role}]\n${s.output}`)
    .join("\n\n");

  const agentSubject: Subject = {
    type: "machine",
    id: `agent:${step.agentId}`,
    principalType: "agent",
    allowlist: ["tool.execute", "project.read"],
  };

  let proposal = "";
  try {
    const llm = await completeLlm(agentSubject, {
      system: `Agente ${step.agentId}. Solo propuesta; no implementes.`,
      prompt: proposalPrompt(
        step.role,
        encargo.serviceKey,
        encargo.description,
        prior
      ),
    });
    proposal = llm.text;
  } catch (err) {
    proposal =
      `[Propuesta local — LLM no disponible]\n` +
      `Rol ${step.role} para servicio ${encargo.serviceKey}.\n` +
      `Brief: ${encargo.description.slice(0, 500)}\n` +
      `Acción sugerida: elaborar entregable de ${step.role} alineado al brief.\n` +
      `(${err instanceof Error ? err.message : "llm_unavailable"})`;
  }

  await store.updateStep(step.id, { status: "proposed", proposal });
  await store.updateEncargo(encargoId, { status: "awaiting_approval" });
  return toView(encargoId);
}

/**
 * Human OK — only then may the agent implement.
 */
export async function approveStep(
  subject: Subject,
  encargoId: string,
  stepId: string
): Promise<EncargoView> {
  assertCan(subject, "agent.execute");
  const store = getEncargoStore();
  const encargo = await store.getEncargo(encargoId);
  if (!encargo) throw new EncargoError("not_found", "encargo_not_found", 404);
  const step = await store.getStep(stepId);
  if (!step || step.encargoId !== encargoId) {
    throw new EncargoError("not_found", "step_not_found", 404);
  }
  if (step.status !== "proposed") {
    throw new EncargoError("gate_required", "step_must_be_proposed");
  }

  await store.updateStep(step.id, { status: "approved" });
  await store.updateEncargo(encargoId, { status: "running" });

  const steps = await store.listSteps(encargoId);
  const prior = steps
    .filter((s) => s.sortOrder < step.sortOrder && s.output)
    .map((s) => `[${s.role}]\n${s.output}`)
    .join("\n\n");

  await store.updateStep(step.id, { status: "running" });

  try {
    const run = await createAgentRun(subject, {
      agentId: step.agentId,
      projectId: encargo.projectId,
      input: {
        prompt: implementPrompt(
          step.role,
          encargo.serviceKey,
          encargo.description,
          step.proposal,
          prior
        ),
        encargoId,
        stepId: step.id,
        role: step.role,
        humanApproved: true,
      },
    });
    const executed = await executeAgentRun(subject, run.id);
    const text =
      executed.result &&
      typeof executed.result === "object" &&
      typeof (executed.result as { text?: unknown }).text === "string"
        ? String((executed.result as { text: string }).text)
        : JSON.stringify(executed.result ?? {});

    await store.updateStep(step.id, {
      status: "done",
      output: text,
      runId: executed.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "step_failed";
    await store.updateStep(step.id, {
      status: "failed",
      output: message,
    });
    await store.updateEncargo(encargoId, { status: "awaiting_approval" });
    throw err instanceof EncargoError
      ? err
      : new EncargoError("persistence_error", message);
  }

  // Auto-propose next pending step (still needs human OK)
  const refreshed = await store.listSteps(encargoId);
  const next = refreshed.find((s) => s.status === "pending");
  if (next) {
    await proposeStep(subject, encargoId, next.id);
  } else if (refreshed.every((s) => s.status === "done")) {
    await store.updateEncargo(encargoId, { status: "completed" });
  } else {
    await store.updateEncargo(encargoId, { status: "awaiting_approval" });
  }

  return toView(encargoId);
}

export async function rejectStep(
  subject: Subject,
  encargoId: string,
  stepId: string
): Promise<EncargoView> {
  assertCan(subject, "agent.execute");
  const store = getEncargoStore();
  const step = await store.getStep(stepId);
  if (!step || step.encargoId !== encargoId) {
    throw new EncargoError("not_found", "step_not_found", 404);
  }
  if (step.status !== "proposed") {
    throw new EncargoError("conflict", "only_proposed_can_reject");
  }
  await store.updateStep(stepId, {
    status: "rejected",
    proposal: step.proposal + "\n\n[Rechazado por operador]",
  });
  await store.updateEncargo(encargoId, { status: "awaiting_approval" });
  return toView(encargoId);
}
