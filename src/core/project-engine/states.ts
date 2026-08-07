/**
 * Project status machine (ADR-013).
 * Happy path is forward-only one step at a time.
 * cancelled / archived are lateral exits.
 */

export const PROJECT_STATUSES = [
  "draft",
  "planning",
  "in_progress",
  "qa",
  "review",
  "approved",
  "delivered",
  "maintenance",
  "cancelled",
  "archived",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export function isProjectStatus(value: unknown): value is ProjectStatus {
  return (
    typeof value === "string" &&
    (PROJECT_STATUSES as readonly string[]).includes(value)
  );
}

/** Next status on the primary lifecycle path, or null if terminal on that path. */
const FORWARD: Record<ProjectStatus, ProjectStatus | null> = {
  draft: "planning",
  planning: "in_progress",
  in_progress: "qa",
  qa: "review",
  review: "approved",
  approved: "delivered",
  delivered: "maintenance",
  maintenance: null,
  cancelled: null,
  archived: null,
};

/**
 * Whether `from → to` is a legal transition.
 */
export function canTransition(
  from: ProjectStatus,
  to: ProjectStatus
): boolean {
  if (from === to) return false;
  if (to === "cancelled") {
    return from !== "cancelled" && from !== "archived";
  }
  if (to === "archived") {
    return (
      from === "cancelled" || from === "delivered" || from === "maintenance"
    );
  }
  return FORWARD[from] === to;
}

export function forwardStatus(from: ProjectStatus): ProjectStatus | null {
  return FORWARD[from];
}
