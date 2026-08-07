/**
 * Project Engine domain types (Bloque 2 · ADR-013).
 */

import type { ProjectStatus } from "./states";

export type { ProjectStatus };

export type Project = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  serviceType: string;
  status: ProjectStatus;
  clientId: string | null;
  leadId: string | null;
  description: string;
  metadata: Record<string, unknown>;
  createdBy: string | null;
  updatedBy: string | null;
};

export type ProjectVersion = {
  id: string;
  projectId: string;
  label: string;
  notes: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  createdBy: string | null;
};

export type Deliverable = {
  id: string;
  projectId: string;
  versionId: string | null;
  kind: string;
  title: string;
  uri: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  createdBy: string | null;
};

export type ProjectEvent = {
  id: string;
  projectId: string;
  createdAt: string;
  eventType: string;
  actorType: string | null;
  actorId: string | null;
  payload: Record<string, unknown>;
};

export type CreateProjectInput = {
  name: string;
  serviceType: string;
  clientId?: string | null;
  leadId?: string | null;
  description?: string;
  metadata?: Record<string, unknown>;
};

export type UpdateProjectMetaInput = {
  name?: string;
  serviceType?: string;
  clientId?: string | null;
  leadId?: string | null;
  description?: string;
  metadata?: Record<string, unknown>;
};

export type CreateVersionInput = {
  label: string;
  notes?: string;
  metadata?: Record<string, unknown>;
};

export type RegisterDeliverableInput = {
  title: string;
  kind?: string;
  uri?: string | null;
  versionId?: string | null;
  metadata?: Record<string, unknown>;
};

export type ListProjectsFilter = {
  status?: ProjectStatus;
  clientId?: string;
  limit?: number;
  offset?: number;
};

export type EngineErrorCode =
  | "forbidden"
  | "not_found"
  | "invalid_input"
  | "invalid_transition"
  | "conflict"
  | "persistence_error";

export class ProjectEngineError extends Error {
  readonly code: EngineErrorCode;
  readonly status: number;

  constructor(code: EngineErrorCode, message: string, status?: number) {
    super(message);
    this.name = "ProjectEngineError";
    this.code = code;
    this.status =
      status ??
      (code === "forbidden"
        ? 403
        : code === "not_found"
          ? 404
          : code === "conflict"
            ? 409
            : code === "persistence_error"
              ? 502
              : 400);
  }
}
