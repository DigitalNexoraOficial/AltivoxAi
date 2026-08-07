export {
  ENCARGO_SERVICES,
  ENCARGO_STEP_ROLES,
  isEncargoServiceKey,
  serviceLabelFor,
  agentIdForRole,
  type EncargoServiceKey,
  type Encargo,
  type EncargoStep,
  type EncargoView,
} from "./types";

export { EncargoError, type EncargoErrorCode } from "./errors";

export {
  createEncargoDraft,
  continueEncargo,
  getEncargoView,
  listEncargos,
  proposeStep,
  approveStep,
  rejectStep,
} from "./use-cases";

export {
  resetEncargoStoreForTests,
  setEncargoStoreForTests,
  createMemoryEncargoStore,
} from "./internal/store";
