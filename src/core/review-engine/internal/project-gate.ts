/**
 * PE gate — public getProject only (ADR-016). No PE internals / SQL.
 */

import { getProject, ProjectEngineError } from "@/core/project-engine";
import type { Subject } from "@/core/security";
import { ReviewError } from "../errors";

export type ProjectGateResult = {
  id: string;
  name: string;
  status: string;
};

export type ProjectGate = (
  subject: Subject,
  projectId: string
) => Promise<ProjectGateResult>;

const defaultGate: ProjectGate = async (subject, projectId) => {
  try {
    const p = await getProject(subject, projectId);
    return { id: p.id, name: p.name, status: p.status };
  } catch (err) {
    if (err instanceof ProjectEngineError) {
      if (err.code === "forbidden") {
        throw new ReviewError("forbidden", "project_read_denied", 403);
      }
      if (err.code === "not_found") {
        throw new ReviewError("not_found", "project_not_found", 404);
      }
      throw new ReviewError(
        err.code === "persistence_error" ? "persistence_error" : "invalid_input",
        `project_gate:${err.message}`,
        err.status
      );
    }
    throw err;
  }
};

let activeGate: ProjectGate = defaultGate;

export function getProjectGate(): ProjectGate {
  return activeGate;
}

/** Selftests only. */
export function setProjectGateForTests(gate: ProjectGate | null): void {
  activeGate = gate ?? defaultGate;
}
