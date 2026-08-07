/**
 * Project Engine — public API (Bloque 2 · ADR-013).
 *
 * JARVIS and Ops Route Handlers should call use-cases only.
 * Domain events → project_events. Technical authz → audit_events (security).
 */

export {
  PROJECT_STATUSES,
  isProjectStatus,
  canTransition,
  forwardStatus,
  type ProjectStatus,
} from "./states";

export {
  PROJECT_EVENT_TYPES,
  eventTypeForStatusChange,
  type ProjectEventType,
} from "./events";

export {
  actionForOp,
  actionForTransition,
  projectResource,
  type ProjectOp,
} from "./permissions";

export type {
  Project,
  ProjectVersion,
  Deliverable,
  ProjectEvent,
  CreateProjectInput,
  UpdateProjectMetaInput,
  CreateVersionInput,
  RegisterDeliverableInput,
  ListProjectsFilter,
  EngineErrorCode,
} from "./types";

export { ProjectEngineError } from "./types";

export {
  createProject,
  listProjects,
  getProject,
  updateProjectMeta,
  transitionProject,
  createVersion,
  registerDeliverable,
  listTimeline,
} from "./use-cases";
