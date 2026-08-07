/**
 * Deploy Engine — public surface (Bloque 7 · ADR-017).
 *
 * JARVIS and Ops Route Handlers call use-cases only.
 * No external providers. No Review/Agent Runtime coupling.
 */

export {
  DEPLOYMENT_STATUSES,
  isDeploymentStatus,
  canTransitionDeployment,
  isActiveDeployment,
  isTerminalDeployment,
  type DeploymentStatus,
} from "./states";

export type {
  DeployDeliverableRef,
  Deployment,
  DeploymentEvent,
  CreateDeploymentInput,
  ConfigureDeploymentInput,
  DeploymentView,
} from "./types";

export { DeployError, type DeployErrorCode } from "./errors";

export {
  createDeployment,
  getDeployment,
  listDeployments,
  executeDeployment,
  cancelDeployment,
  configureDeployment,
} from "./use-cases";

export {
  resetDeployStoreForTests,
  setDeployStoreForTests,
  createMemoryDeployStore,
} from "./internal/repository";

export { setProjectGateForTests } from "./internal/project-gate";

export {
  resetPackageStoreForTests,
  getMemoryPackage,
} from "./internal/package-store";
