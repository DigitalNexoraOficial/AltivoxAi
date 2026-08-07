/**
 * JARVIS Core — internal orchestration intentions (Bloque 4–5).
 * PE ops + agent orchestration. No chatbot, no direct LLM.
 */

import type {
  CreateProjectInput,
  CreateVersionInput,
  ListProjectsFilter,
  RegisterDeliverableInput,
  UpdateProjectMetaInput,
} from "@/core/project-engine";
import type { AgentManifest, CreateRunInput } from "@/core/agent-runtime";

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
  | { op: "project.timeline"; projectId: string; limit?: number }
  | { op: "agent.register"; manifest: Partial<AgentManifest> }
  | { op: "agent.list" }
  | { op: "agent.resolve"; capability: string }
  | { op: "agent.run.create"; input: CreateRunInput }
  | { op: "agent.run.execute"; runId: string }
  | { op: "agent.run.cancel"; runId: string }
  | { op: "agent.run.get"; runId: string }
  | { op: "agent.bootstrap_web" };

export class JarvisError extends Error {
  readonly code: "invalid_intention" | "invalid_subject";
  constructor(code: "invalid_intention" | "invalid_subject", message: string) {
    super(message);
    this.name = "JarvisError";
    this.code = code;
  }
}
