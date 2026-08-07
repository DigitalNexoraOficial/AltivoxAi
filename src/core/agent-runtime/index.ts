/**
 * Agent Runtime — public surface (Bloque 5 · ADR-015).
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
  resetAgentStoreForTests,
  setAgentStoreForTests,
  createMemoryAgentStore,
} from "./internal/store";
