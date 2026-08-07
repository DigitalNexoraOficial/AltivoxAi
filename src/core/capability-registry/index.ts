/**
 * Capability Registry — runtime mínimo (Bloque 5 · ADR-015).
 * Resolves capabilities from registered agent manifests only.
 */

import { can, type Subject } from "@/core/security";
import { AgentError } from "@/core/agent-runtime/errors";
import { getAgentStore } from "@/core/agent-runtime/internal/store";

export interface CapabilityRegistry {
  readonly __frontier: "CapabilityRegistry";
}

export async function resolveCapability(
  subject: Subject,
  capability: string
): Promise<string[]> {
  if (
    !can(subject, "capability.assign").allowed &&
    !can(subject, "agent.execute").allowed &&
    !can(subject, "agent.configure").allowed
  ) {
    throw new AgentError("forbidden", "capability_resolve_denied", 403);
  }
  const cap = String(capability || "").trim();
  if (!cap) throw new AgentError("invalid_input", "capability_required");
  const agents = await getAgentStore().listAgents();
  return agents
    .filter((a) => a.enabled && a.capabilities.includes(cap))
    .map((a) => a.id);
}
