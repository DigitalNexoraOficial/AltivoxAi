/**
 * Memory Engine — runtime mínimo: hechos de agent runs (ADR-015).
 * No KB, embeddings, or global memory.
 */

import { can, type Subject } from "@/core/security";
import { AgentError } from "@/core/agent-runtime/errors";
import { getAgentStore } from "@/core/agent-runtime/store";
import type { AgentRunFact } from "@/core/agent-runtime/types";

export interface MemoryEngine {
  readonly __frontier: "MemoryEngine";
}

export async function appendRunFact(
  subject: Subject,
  runId: string,
  kind: string,
  payload: Record<string, unknown> = {}
): Promise<AgentRunFact> {
  if (!can(subject, "agent.execute").allowed) {
    throw new AgentError("forbidden", "memory_append_denied", 403);
  }
  const k = String(kind || "").trim();
  if (!k) throw new AgentError("invalid_input", "fact_kind_required");
  const run = await getAgentStore().getRun(runId);
  if (!run) throw new AgentError("not_found", "run_not_found");
  return getAgentStore().appendFact(runId, k.slice(0, 80), payload);
}

export async function listRunFacts(
  subject: Subject,
  runId: string
): Promise<AgentRunFact[]> {
  const canRead =
    can(subject, "agent.execute").allowed ||
    can(subject, "project.read").allowed;
  if (!canRead) {
    throw new AgentError("forbidden", "memory_read_denied", 403);
  }
  const run = await getAgentStore().getRun(runId);
  if (!run) throw new AgentError("not_found", "run_not_found");
  return getAgentStore().listFacts(runId);
}
