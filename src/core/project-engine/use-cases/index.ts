/**
 * Project Engine use-cases — public application API for Ops / future JARVIS.
 * Every mutation checks can(subject, action, resource) first.
 */

import { can, type Subject } from "@/core/security";
import { eventTypeForStatusChange } from "../events";
import {
  actionForOp,
  actionForTransition,
  projectResource,
} from "../permissions";
import { normalizeCreateInput, normalizeMetaPatch } from "../project";
import * as repo from "../internal/repository";
import { canTransition, isProjectStatus, type ProjectStatus } from "../states";
import type {
  CreateProjectInput,
  CreateVersionInput,
  Deliverable,
  ListProjectsFilter,
  Project,
  ProjectEvent,
  ProjectVersion,
  RegisterDeliverableInput,
  UpdateProjectMetaInput,
} from "../types";
import { ProjectEngineError } from "../types";

function actor(subject: Subject): repo.ActorRef {
  return { actorType: subject.type, actorId: subject.id };
}

function assertCan(
  subject: Subject,
  action: string,
  projectId?: string
): void {
  const decision = can(subject, action, projectResource(projectId));
  if (!decision.allowed) {
    throw new ProjectEngineError("forbidden", decision.reason, 403);
  }
}

export async function createProject(
  subject: Subject,
  input: Partial<CreateProjectInput>
): Promise<Project> {
  assertCan(subject, actionForOp("create"));
  const normalized = normalizeCreateInput(input);
  return repo.createProjectAtomic(normalized, actor(subject));
}

export async function listProjects(
  subject: Subject,
  filter: ListProjectsFilter = {}
): Promise<Project[]> {
  assertCan(subject, actionForOp("read"));
  if (filter.status !== undefined && !isProjectStatus(filter.status)) {
    throw new ProjectEngineError("invalid_input", "invalid_status_filter");
  }
  return repo.listProjects(filter);
}

export async function getProject(
  subject: Subject,
  projectId: string
): Promise<Project> {
  assertCan(subject, actionForOp("read"), projectId);
  const project = await repo.fetchProjectById(projectId);
  if (!project) {
    throw new ProjectEngineError("not_found", "project_not_found", 404);
  }
  return project;
}

export async function updateProjectMeta(
  subject: Subject,
  projectId: string,
  input: Partial<UpdateProjectMetaInput>
): Promise<Project> {
  assertCan(subject, actionForOp("update_meta"), projectId);
  const existing = await repo.fetchProjectById(projectId);
  if (!existing) {
    throw new ProjectEngineError("not_found", "project_not_found", 404);
  }
  if (existing.status === "archived" || existing.status === "cancelled") {
    throw new ProjectEngineError(
      "invalid_input",
      "project_immutable_in_status:" + existing.status
    );
  }
  const patch = normalizeMetaPatch(input);
  return repo.updateProjectMetaAtomic(projectId, patch, actor(subject));
}

export async function transitionProject(
  subject: Subject,
  projectId: string,
  toStatus: string
): Promise<Project> {
  if (!isProjectStatus(toStatus)) {
    throw new ProjectEngineError("invalid_input", "invalid_target_status");
  }
  const to: ProjectStatus = toStatus;
  assertCan(subject, actionForTransition(to), projectId);

  const existing = await repo.fetchProjectById(projectId);
  if (!existing) {
    throw new ProjectEngineError("not_found", "project_not_found", 404);
  }
  if (!canTransition(existing.status, to)) {
    throw new ProjectEngineError(
      "invalid_transition",
      `cannot_transition:${existing.status}->${to}`
    );
  }

  try {
    return await repo.transitionProjectAtomic(
      projectId,
      existing.status,
      to,
      eventTypeForStatusChange(to),
      actor(subject),
      { from: existing.status, to }
    );
  } catch (err) {
    if (
      err instanceof ProjectEngineError &&
      err.code === "conflict" &&
      err.message === "transition_conflict"
    ) {
      throw new ProjectEngineError(
        "conflict",
        `cannot_transition:${existing.status}->${to}:stale`,
        409
      );
    }
    throw err;
  }
}

export async function createVersion(
  subject: Subject,
  projectId: string,
  input: Partial<CreateVersionInput>
): Promise<ProjectVersion> {
  assertCan(subject, actionForOp("create_version"), projectId);
  const label = String(input.label || "").trim();
  if (!label) {
    throw new ProjectEngineError("invalid_input", "label_required");
  }
  if (label.length > 100) {
    throw new ProjectEngineError("invalid_input", "label_too_long");
  }
  const existing = await repo.fetchProjectById(projectId);
  if (!existing) {
    throw new ProjectEngineError("not_found", "project_not_found", 404);
  }
  if (existing.status === "archived" || existing.status === "cancelled") {
    throw new ProjectEngineError(
      "invalid_input",
      "project_immutable_in_status:" + existing.status
    );
  }
  return repo.createVersionAtomic(
    projectId,
    {
      label,
      notes: String(input.notes || "").slice(0, 4000),
      metadata:
        input.metadata &&
        typeof input.metadata === "object" &&
        !Array.isArray(input.metadata)
          ? input.metadata
          : {},
    },
    actor(subject)
  );
}

export async function registerDeliverable(
  subject: Subject,
  projectId: string,
  input: Partial<RegisterDeliverableInput>
): Promise<Deliverable> {
  assertCan(subject, actionForOp("register_deliverable"), projectId);
  const title = String(input.title || "").trim();
  if (!title) {
    throw new ProjectEngineError("invalid_input", "title_required");
  }
  const existing = await repo.fetchProjectById(projectId);
  if (!existing) {
    throw new ProjectEngineError("not_found", "project_not_found", 404);
  }
  if (existing.status === "archived" || existing.status === "cancelled") {
    throw new ProjectEngineError(
      "invalid_input",
      "project_immutable_in_status:" + existing.status
    );
  }
  const versionId = input.versionId || null;
  if (versionId) {
    const ver = await repo.fetchVersion(projectId, versionId);
    if (!ver) {
      throw new ProjectEngineError("not_found", "version_not_found", 404);
    }
  }
  return repo.registerDeliverableAtomic(
    projectId,
    {
      title,
      kind: String(input.kind || "artifact").slice(0, 80),
      uri: input.uri === undefined ? null : input.uri || null,
      versionId,
      metadata:
        input.metadata &&
        typeof input.metadata === "object" &&
        !Array.isArray(input.metadata)
          ? input.metadata
          : {},
    },
    actor(subject)
  );
}

export async function listTimeline(
  subject: Subject,
  projectId: string,
  limit?: number
): Promise<ProjectEvent[]> {
  assertCan(subject, actionForOp("read"), projectId);
  const existing = await repo.fetchProjectById(projectId);
  if (!existing) {
    throw new ProjectEngineError("not_found", "project_not_found", 404);
  }
  return repo.listTimeline(projectId, limit);
}
