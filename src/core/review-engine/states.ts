/**
 * Review session lifecycle states (Bloque 6 · ADR-016).
 * Independent from projects.status.
 */

export const REVIEW_STATUSES = [
  "draft",
  "sent",
  "viewed",
  "changes_requested",
  "approved",
  "rejected",
  "revoked",
] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export function isReviewStatus(v: string): v is ReviewStatus {
  return (REVIEW_STATUSES as readonly string[]).includes(v);
}

/** Terminal statuses — no client mutations except none. */
export function isTerminalStatus(status: ReviewStatus): boolean {
  return (
    status === "approved" ||
    status === "rejected" ||
    status === "revoked"
  );
}

/**
 * Allowed status transitions for Review Engine.
 * revoke is handled as a dedicated path from any non-revoked state.
 */
export function canTransitionReview(
  from: ReviewStatus,
  to: ReviewStatus
): boolean {
  if (from === to) return false;
  if (to === "revoked") return from !== "revoked";
  if (from === "revoked") return false;
  if (from === "approved" || from === "rejected") return false;

  if (from === "draft" && to === "sent") return true;
  if (from === "sent" && (to === "viewed" || to === "changes_requested" || to === "approved" || to === "rejected"))
    return true;
  if (
    from === "viewed" &&
    (to === "changes_requested" || to === "approved" || to === "rejected")
  )
    return true;
  if (
    from === "changes_requested" &&
    (to === "approved" || to === "rejected" || to === "viewed")
  )
    return true;
  return false;
}

/** Client may act when session is open for feedback. */
export function canClientAct(status: ReviewStatus): boolean {
  return (
    status === "sent" ||
    status === "viewed" ||
    status === "changes_requested"
  );
}
