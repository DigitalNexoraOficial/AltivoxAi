/**
 * PE gate — public getProject only (ADR-017). No PE internals / SQL.
 */

import { getProject, ProjectEngineError } from "@/core/project-engine";
import type { Subject } from "@/core/security";
import { DeployError } from "../errors";

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
        throw new DeployError("forbidden", "project_read_denied", 403);
      }
      if (err.code === "not_found") {
        throw new DeployError("not_found", "project_not_found", 404);
      }
    }
    throw err;
  }
};

let activeGate: ProjectGate = defaultGate;

export function getProjectGate(): ProjectGate {
  return activeGate;
}

export function setProjectGateForTests(gate: ProjectGate | null): void {
  activeGate = gate ?? defaultGate;
}
