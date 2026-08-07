/**
 * Agent Runtime — public surface (Bloque 5 · ADR-015).
 *
 * Public modules (import these — never `internal/*`):
 * - `@/core/agent-runtime` — use-cases + re-exports (OPS/JARVIS callers)
 * - `@/core/agent-runtime/store` — catalog/run store (Agent Manager, Memory, Capability)
 * - `@/core/agent-runtime/types` · `errors` · `states` — contratos
 *
 * Separation:
 * - Agent Manager: manifests, capabilities, resolution
 * - Agent Runtime: runs, states, execution
 */

export {
  AGENT_RUN_STATUSES,
  isAgentRunStatus,
  canTransitionRun,
  ALLOWED_TOOLS,
  isAllowedTool,
  type AgentRunStatus,
  type AllowedTool,
} from "./states";

export type {
  AgentManifest,
  AgentRecord,
  AgentRun,
  AgentRunFact,
  CreateRunInput,
} from "./types";

export { AgentError, type AgentErrorCode } from "./errors";

export {
  createAgentRun,
  getAgentRun,
  executeAgentRun,
  cancelAgentRun,
} from "./use-cases";

export {
  getAgentStore,
  resetAgentStoreForTests,
  setAgentStoreForTests,
  createMemoryAgentStore,
  type AgentStore,
  type ActorRef,
} from "./store";
