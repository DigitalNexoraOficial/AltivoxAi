/**
 * Review Engine — public surface (Bloque 6 · ADR-016).
 *
 * JARVIS and Ops Route Handlers call use-cases only.
 * Portal uses token-based use-cases (no staff session).
 */

export {
  REVIEW_STATUSES,
  isReviewStatus,
  canTransitionReview,
  canClientAct,
  isTerminalStatus,
  type ReviewStatus,
} from "./states";

export type {
  ReviewDeliverableSnapshot,
  ReviewSession,
  ReviewTokenRecord,
  ReviewComment,
  ReviewEvent,
  CreateReviewInput,
  ReviewOpsView,
  ReviewClientView,
} from "./types";

export { ReviewError, type ReviewErrorCode } from "./errors";

export {
  createReview,
  getReviewForOps,
  listReviewsForProject,
  revokeReview,
  getReviewByToken,
  commentOnReview,
  requestChangesOnReview,
  approveReview,
  rejectReview,
} from "./use-cases";

export {
  resetReviewStoreForTests,
  setReviewStoreForTests,
  createMemoryReviewStore,
} from "./internal/store";

export { setProjectGateForTests } from "./internal/project-gate";
