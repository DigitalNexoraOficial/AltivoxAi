/**
 * JARVIS Core — internal orchestration intentions (Bloque 4 · ADR-014).
 * Only Project Engine public operations. No chatbot, vendors, or motor runtimes.
 */

import type {
  CreateProjectInput,
  CreateVersionInput,
  ListProjectsFilter,
  RegisterDeliverableInput,
  UpdateProjectMetaInput,
} from "@/core/project-engine";

export type JarvisIntention =
  | { op: "project.create"; input: Partial<CreateProjectInput> }
  | { op: "project.list"; filter?: ListProjectsFilter }
  | { op: "project.get"; projectId: string }
  | {
      op: "project.update_meta";
      projectId: string;
      input: Partial<UpdateProjectMetaInput>;
    }
  | { op: "project.transition"; projectId: string; toStatus: string }
  | {
      op: "project.create_version";
      projectId: string;
      input: Partial<CreateVersionInput>;
    }
  | {
      op: "project.register_deliverable";
      projectId: string;
      input: Partial<RegisterDeliverableInput>;
    }
  | { op: "project.timeline"; projectId: string; limit?: number };

export class JarvisError extends Error {
  readonly code: "invalid_intention" | "invalid_subject";
  constructor(code: "invalid_intention" | "invalid_subject", message: string) {
    super(message);
    this.name = "JarvisError";
    this.code = code;
  }
}
