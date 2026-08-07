/**
 * Agent Manager — boundary contract only (Bloque 4 · ADR-014).
 * Not a runtime: no registration, scheduling, or agent execution (Bloque 5).
 */
export interface AgentManagerBoundary {
  readonly __frontier: "AgentManagerBoundary";
}
