/**
 * Maps Project Engine operations → Permission Manager actions.
 */

import type { Action } from "@/core/security";
import type { ProjectStatus } from "./states";

export type ProjectOp =
  | "create"
  | "read"
  | "update_meta"
  | "transition"
  | "create_version"
  | "register_deliverable";

/**
 * Action required for a status transition.
 * Entering `approved` requires project.approve; everything else uses project.transition.
 */
export function actionForTransition(to: ProjectStatus): Action {
  if (to === "approved") return "project.approve";
  return "project.transition";
}

export function actionForOp(op: ProjectOp): Action {
  switch (op) {
    case "create":
      return "project.create";
    case "read":
      return "project.read";
    case "update_meta":
      return "project.update";
    case "transition":
      return "project.transition";
    case "create_version":
      return "project.update";
    case "register_deliverable":
      return "deliverable.generate";
  }
}

export function projectResource(projectId?: string) {
  return {
    type: "project" as const,
    id: projectId,
    projectId,
  };
}
