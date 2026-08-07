/**
 * Domain event type catalog for project_events (not audit_events).
 */

export const PROJECT_EVENT_TYPES = [
  "project.created",
  "project.updated",
  "project.status_changed",
  "project.version_created",
  "project.deliverable_registered",
  "project.cancelled",
  "project.archived",
] as const;

export type ProjectEventType = (typeof PROJECT_EVENT_TYPES)[number];

export function eventTypeForStatusChange(
  to: string
): ProjectEventType {
  if (to === "cancelled") return "project.cancelled";
  if (to === "archived") return "project.archived";
  return "project.status_changed";
}
