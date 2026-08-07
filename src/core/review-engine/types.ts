/**
 * Domain types — Review Engine (Bloque 6 · ADR-016).
 */

import type { ReviewStatus } from "./states";

/** Client-safe deliverable snapshot (no internal agent/ops data). */
export type ReviewDeliverableSnapshot = {
  deliverableId: string;
  title: string;
  kind: string;
  uri: string | null;
  metadata: Record<string, unknown>;
};

export type ReviewSession = {
  id: string;
  projectId: string;
  versionId: string;
  status: ReviewStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  createdByType: string | null;
  /** Set when revoked. */
  revokedAt: string | null;
};

export type ReviewTokenRecord = {
  id: string;
  reviewId: string;
  tokenHash: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
};

export type ReviewComment = {
  id: string;
  reviewId: string;
  authorType: "client" | "ops";
  body: string;
  createdAt: string;
};

export type ReviewEvent = {
  id: string;
  reviewId: string;
  event: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type CreateReviewInput = {
  projectId: string;
  versionId: string;
  /** Allowlisted deliverables with client-safe snapshot. */
  deliverables: ReviewDeliverableSnapshot[];
  /** ISO expiry; default +14 days if omitted. */
  expiresAt?: string;
  /**
   * If false, session stays `draft` without usable token.
   * Default true → `sent` + plaintext token returned once.
   */
  activate?: boolean;
};

/** Ops view — never includes plaintext token after create. */
export type ReviewOpsView = {
  review: ReviewSession;
  deliverables: ReviewDeliverableSnapshot[];
  comments: ReviewComment[];
  events: ReviewEvent[];
  /** Present only on create/activate response. */
  token?: string;
  portalPath?: string;
};

/** Portal view — sanitized for client. */
export type ReviewClientView = {
  reviewId: string;
  status: ReviewStatus;
  expiresAt: string;
  projectId: string;
  versionId: string;
  deliverables: ReviewDeliverableSnapshot[];
  comments: Array<{ id: string; body: string; createdAt: string }>;
};
