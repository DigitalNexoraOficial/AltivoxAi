/**
 * Deployment lifecycle states (Bloque 7 · ADR-017).
 * Independent from projects.status and Review statuses.
 */

export const DEPLOYMENT_STATUSES = [
  "draft",
  "queued",
  "building",
  "packaged",
  "deploying",
  "deployed",
  "failed",
  "cancelled",
] as const;

export type DeploymentStatus = (typeof DEPLOYMENT_STATUSES)[number];

export function isDeploymentStatus(v: string): v is DeploymentStatus {
  return (DEPLOYMENT_STATUSES as readonly string[]).includes(v);
}

export function isTerminalDeployment(status: DeploymentStatus): boolean {
  return (
    status === "deployed" ||
    status === "failed" ||
    status === "cancelled"
  );
}

/** Active = may be cancelled. */
export function isActiveDeployment(status: DeploymentStatus): boolean {
  return (
    status === "draft" ||
    status === "queued" ||
    status === "building" ||
    status === "packaged" ||
    status === "deploying"
  );
}

/**
 * Allowed transitions (ADR-017).
 * execute path: draft → queued → building → packaged
 */
export function canTransitionDeployment(
  from: DeploymentStatus,
  to: DeploymentStatus
): boolean {
  if (from === to) return false;
  if (to === "cancelled") return isActiveDeployment(from);
  if (from === "cancelled" || from === "deployed") return false;

  if (from === "draft" && to === "queued") return true;
  if (from === "queued" && (to === "building" || to === "failed")) return true;
  if (from === "building" && (to === "packaged" || to === "failed")) return true;
  if (from === "packaged" && (to === "deploying" || to === "failed")) return true;
  if (from === "deploying" && (to === "deployed" || to === "failed")) return true;
  return false;
}
