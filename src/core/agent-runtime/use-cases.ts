/**
 * Agent Runtime use-cases (Bloque 5 · ADR-015).
 */

import { can, type Subject } from "@/core/security";
import { completeLlm } from "@/core/tool-registry";
import { appendRunFact } from "@/core/memory-engine";
import { AgentError } from "./errors";
import { canTransitionRun } from "./states";
import { getAgentStore } from "./internal/store";
import type { AgentRecord, AgentRun, CreateRunInput } from "./types";

function actor(subject: Subject) {
  return { actorType: subject.type, actorId: subject.id };
}

function assertCan(subject: Subject, action: string): void {
  const d = can(subject, action);
  if (!d.allowed) throw new AgentError("forbidden", d.reason, 403);
}

/** Resolve agent from Runtime store after can() — no Agent Manager import (no cycle). */
async function resolveAgentRecord(agentId: string): Promise<AgentRecord> {
  const agent = await getAgentStore().getAgent(agentId);
  if (!agent) throw new AgentError("not_found", "agent_not_found");
  return agent;
}

export async function createAgentRun(
  subject: Subject,
  input: CreateRunInput
): Promise<AgentRun> {
  assertCan(subject, "agent.execute");
  const agentId = String(input.agentId || "").trim();
  if (!agentId) throw new AgentError("invalid_input", "agent_id_required");
  const agent = await resolveAgentRecord(agentId);
  if (!agent.enabled) throw new AgentError("invalid_input", "agent_disabled");
  return getAgentStore().createRun(
    {
      agentId: agent.id,
      projectId: input.projectId ? String(input.projectId) : null,
      input:
        input.input && typeof input.input === "object" && !Array.isArray(input.input)
          ? input.input
          : {},
    },
    actor(subject)
  );
}

export async function getAgentRun(
  subject: Subject,
  runId: string
): Promise<AgentRun> {
  if (!can(subject, "agent.execute").allowed && !can(subject, "project.read").allowed) {
    throw new AgentError("forbidden", "run_read_denied", 403);
  }
  const run = await getAgentStore().getRun(runId);
  if (!run) throw new AgentError("not_found", "run_not_found");
  return run;
}

export async function cancelAgentRun(
  subject: Subject,
  runId: string
): Promise<AgentRun> {
  assertCan(subject, "agent.stop");
  const run = await getAgentStore().getRun(runId);
  if (!run) throw new AgentError("not_found", "run_not_found");
  if (!canTransitionRun(run.status, "cancelled")) {
    throw new AgentError(
      "invalid_transition",
      `cannot_cancel:${run.status}`
    );
  }
  return getAgentStore().updateRunStatus(run.id, run.status, "cancelled", {
    error: "cancelled",
  });
}

/**
 * Execute a queued run: Agent Runtime owns lifecycle.
 * LLM only via Tool Registry; JARVIS must not call this tool itself for agent work.
 */
export async function executeAgentRun(
  subject: Subject,
  runId: string
): Promise<AgentRun> {
  assertCan(subject, "agent.execute");
  const store = getAgentStore();
  const run = await store.getRun(runId);
  if (!run) throw new AgentError("not_found", "run_not_found");
  if (!canTransitionRun(run.status, "running")) {
    throw new AgentError(
      "invalid_transition",
      `cannot_start:${run.status}`
    );
  }

  const agent = await resolveAgentRecord(run.agentId);
  if (!agent.enabled) {
    await store.updateRunStatus(run.id, run.status, "failed", {
      error: "agent_disabled",
    });
    throw new AgentError("invalid_input", "agent_disabled");
  }

  let current = await store.updateRunStatus(run.id, "queued", "running");
  await appendRunFact(subject, current.id, "run.started", {
    agentId: agent.id,
  });

  try {
    const promptFromInput =
      typeof run.input.prompt === "string" ? run.input.prompt : "";
    const userPrompt =
      promptFromInput.trim() ||
      `Ejecuta tu especialidad para el proyecto contexto: ${JSON.stringify(run.input).slice(0, 2000)}`;

    let llmText = "";
    if (agent.tools.includes("llm.complete")) {
      // Agent machine subject for tool ceiling (not human elevation)
      const agentSubject: Subject = {
        type: "machine",
        id: `agent:${agent.id}`,
        principalType: "agent",
        allowlist: ["tool.execute", "project.read"],
      };
      const llm = await completeLlm(agentSubject, {
        system: agent.prompt,
        prompt: userPrompt,
      });
      llmText = llm.text;
      await appendRunFact(subject, current.id, "tool.llm.complete", {
        provider: llm.provider,
        chars: llmText.length,
      });
    }

    current = await store.updateRunStatus(current.id, "running", "completed", {
      result: { text: llmText, agentId: agent.id },
      error: null,
    });
    await appendRunFact(subject, current.id, "run.completed", {
      agentId: agent.id,
    });
    return current;
  } catch (err) {
    const message =
      err instanceof AgentError ? err.message : "execution_error";
    try {
      current = await store.updateRunStatus(current.id, "running", "failed", {
        error: message,
      });
      await appendRunFact(subject, current.id, "run.failed", { error: message });
    } catch {
      /* ignore secondary */
    }
    if (err instanceof AgentError) throw err;
    throw new AgentError("execution_error", message);
  }
}
