/**
 * Agent run lifecycle states (Bloque 5 · ADR-015).
 */

export const AGENT_RUN_STATUSES = [
  "queued",
  "running",
  "completed",
  "failed",
  "cancelled",
] as const;

export type AgentRunStatus = (typeof AGENT_RUN_STATUSES)[number];

export function isAgentRunStatus(v: string): v is AgentRunStatus {
  return (AGENT_RUN_STATUSES as readonly string[]).includes(v);
}

/** Allowed transitions for Agent Runtime. */
export function canTransitionRun(
  from: AgentRunStatus,
  to: AgentRunStatus
): boolean {
  if (from === to) return false;
  if (from === "queued" && (to === "running" || to === "cancelled")) return true;
  if (from === "running" && (to === "completed" || to === "failed" || to === "cancelled"))
    return true;
  return false;
}

/** Tools allowed by Tool Registry mínimo (ADR-015). */
export const ALLOWED_TOOLS = ["llm.complete"] as const;
export type AllowedTool = (typeof ALLOWED_TOOLS)[number];

export function isAllowedTool(v: string): v is AllowedTool {
  return (ALLOWED_TOOLS as readonly string[]).includes(v);
}
