/**
 * Public Agent Runtime store facade.
 * Sibling modules (Agent Manager, Memory, Capability) import from here —
 * never from `internal/*`, and never from the barrel `index` (avoids cycles with use-cases).
 */

export {
  getAgentStore,
  resetAgentStoreForTests,
  setAgentStoreForTests,
  createMemoryAgentStore,
  type AgentStore,
  type ActorRef,
} from "./internal/store";
