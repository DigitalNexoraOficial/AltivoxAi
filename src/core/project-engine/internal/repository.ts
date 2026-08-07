/**
 * @internal Project Engine persistence — NOT part of the public API.
 *
 * Do not import this module from Route Handlers or future engines.
 * Call use-cases from `@/core/project-engine` instead (they enforce can()).
 *
 * Mutating writes go through SECURITY DEFINER RPCs so project row +
 * project_events commit atomically; status changes require altivox_pe_transition.
 */

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
import type { ProjectStatus } from "../states";
import { isProjectStatus } from "../states";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://soeyfivsuwohuuzgfqar.supabase.co";

type DbProject = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  service_type: string;
  status: string;
  client_id: string | null;
  lead_id: string | null;
  description: string;
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  updated_by: string | null;
};

type DbVersion = {
  id: string;
  project_id: string;
  label: string;
  notes: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  created_by: string | null;
};

type DbDeliverable = {
  id: string;
  project_id: string;
  version_id: string | null;
  kind: string;
  title: string;
  uri: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  created_by: string | null;
};

type DbEvent = {
  id: string;
  project_id: string;
  created_at: string;
  event_type: string;
  actor_type: string | null;
  actor_id: string | null;
  payload: Record<string, unknown> | null;
};

function serviceKey(): string {
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!key) {
    throw new ProjectEngineError(
      "persistence_error",
      "missing_service_role_key",
      500
    );
  }
  return key;
}

async function rest<T>(
  path: string,
  init: RequestInit & { prefer?: string } = {}
): Promise<{ ok: boolean; status: number; data: T | null; text: string }> {
  const key = serviceKey();
  const headers: Record<string, string> = {
    apikey: key,
    Authorization: "Bearer " + key,
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (init.prefer) headers.Prefer = init.prefer;

  const res = await fetch(SUPABASE_URL + "/rest/v1/" + path, {
    ...init,
    headers,
    cache: "no-store",
  });
  const text = await res.text().catch(() => "");
  let data: T | null = null;
  if (text) {
    try {
      data = JSON.parse(text) as T;
    } catch {
      data = null;
    }
  }
  return { ok: res.ok, status: res.status, data, text };
}

function rpcMessage(data: unknown, text: string): string {
  if (data && typeof data === "object" && "message" in data) {
    return String((data as { message: unknown }).message || "");
  }
  return text;
}

function throwRpcError(data: unknown, text: string, httpStatus: number): never {
  const msg = rpcMessage(data, text);
  if (msg.includes("transition_conflict")) {
    throw new ProjectEngineError(
      "conflict",
      "transition_conflict",
      409
    );
  }
  if (msg.includes("project_not_found")) {
    throw new ProjectEngineError("not_found", "project_not_found", 404);
  }
  if (msg.includes("version_label_exists")) {
    throw new ProjectEngineError("conflict", "version_label_exists", 409);
  }
  if (msg.includes("version_not_found")) {
    throw new ProjectEngineError("not_found", "version_not_found", 404);
  }
  if (msg.includes("version_project_mismatch")) {
    throw new ProjectEngineError("invalid_input", "version_project_mismatch");
  }
  if (msg.includes("status_change_forbidden")) {
    throw new ProjectEngineError(
      "persistence_error",
      "status_change_forbidden",
      502
    );
  }
  throw new ProjectEngineError(
    "persistence_error",
    "rpc_failed:" + httpStatus + ":" + msg.slice(0, 160)
  );
}

export function mapProject(row: DbProject): Project {
  if (!isProjectStatus(row.status)) {
    throw new ProjectEngineError(
      "persistence_error",
      "invalid_status_in_db:" + row.status
    );
  }
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    name: row.name,
    serviceType: row.service_type,
    status: row.status,
    clientId: row.client_id,
    leadId: row.lead_id,
    description: row.description || "",
    metadata: row.metadata || {},
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  };
}

function mapVersion(row: DbVersion): ProjectVersion {
  return {
    id: row.id,
    projectId: row.project_id,
    label: row.label,
    notes: row.notes || "",
    metadata: row.metadata || {},
    createdAt: row.created_at,
    createdBy: row.created_by,
  };
}

function mapDeliverable(row: DbDeliverable): Deliverable {
  return {
    id: row.id,
    projectId: row.project_id,
    versionId: row.version_id,
    kind: row.kind,
    title: row.title,
    uri: row.uri,
    metadata: row.metadata || {},
    createdAt: row.created_at,
    createdBy: row.created_by,
  };
}

function mapEvent(row: DbEvent): ProjectEvent {
  return {
    id: row.id,
    projectId: row.project_id,
    createdAt: row.created_at,
    eventType: row.event_type,
    actorType: row.actor_type,
    actorId: row.actor_id,
    payload: row.payload || {},
  };
}

export type ActorRef = {
  actorType: "human" | "machine";
  actorId: string;
};

export async function createProjectAtomic(
  input: CreateProjectInput,
  actor: ActorRef
): Promise<Project> {
  const { ok, status, data, text } = await rest<DbProject>(
    "rpc/altivox_pe_create_project",
    {
      method: "POST",
      body: JSON.stringify({
        p_name: input.name,
        p_service_type: input.serviceType,
        p_client_id: input.clientId || null,
        p_lead_id: input.leadId || null,
        p_description: input.description || "",
        p_metadata: input.metadata || {},
        p_actor_type: actor.actorType,
        p_actor_id: actor.actorId,
      }),
    }
  );
  if (!ok || !data) throwRpcError(data, text, status);
  return mapProject(data);
}

export async function updateProjectMetaAtomic(
  projectId: string,
  patch: UpdateProjectMetaInput,
  actor: ActorRef
): Promise<Project> {
  const { ok, status, data, text } = await rest<DbProject>(
    "rpc/altivox_pe_update_meta",
    {
      method: "POST",
      body: JSON.stringify({
        p_project_id: projectId,
        p_actor_type: actor.actorType,
        p_actor_id: actor.actorId,
        p_name: patch.name ?? null,
        p_service_type: patch.serviceType ?? null,
        p_client_id:
          patch.clientId === undefined || patch.clientId === null
            ? null
            : patch.clientId,
        p_clear_client_id: patch.clientId === null,
        p_lead_id:
          patch.leadId === undefined || patch.leadId === null
            ? null
            : patch.leadId,
        p_clear_lead_id: patch.leadId === null,
        p_description: patch.description ?? null,
        p_metadata: patch.metadata ?? null,
        p_has_metadata: patch.metadata !== undefined,
      }),
    }
  );
  if (!ok || !data) throwRpcError(data, text, status);
  return mapProject(data);
}

export async function transitionProjectAtomic(
  projectId: string,
  fromStatus: ProjectStatus,
  toStatus: ProjectStatus,
  eventType: string,
  actor: ActorRef,
  payload: Record<string, unknown>
): Promise<Project> {
  const { ok, status, data, text } = await rest<DbProject>(
    "rpc/altivox_pe_transition",
    {
      method: "POST",
      body: JSON.stringify({
        p_project_id: projectId,
        p_from_status: fromStatus,
        p_to_status: toStatus,
        p_actor_type: actor.actorType,
        p_actor_id: actor.actorId,
        p_event_type: eventType,
        p_payload: payload,
      }),
    }
  );
  if (!ok || !data) throwRpcError(data, text, status);
  return mapProject(data);
}

export async function createVersionAtomic(
  projectId: string,
  input: CreateVersionInput,
  actor: ActorRef
): Promise<ProjectVersion> {
  const { ok, status, data, text } = await rest<DbVersion>(
    "rpc/altivox_pe_create_version",
    {
      method: "POST",
      body: JSON.stringify({
        p_project_id: projectId,
        p_label: input.label,
        p_notes: input.notes || "",
        p_metadata: input.metadata || {},
        p_actor_type: actor.actorType,
        p_actor_id: actor.actorId,
      }),
    }
  );
  if (!ok || !data) throwRpcError(data, text, status);
  return mapVersion(data);
}

export async function registerDeliverableAtomic(
  projectId: string,
  input: RegisterDeliverableInput,
  actor: ActorRef
): Promise<Deliverable> {
  const { ok, status, data, text } = await rest<DbDeliverable>(
    "rpc/altivox_pe_register_deliverable",
    {
      method: "POST",
      body: JSON.stringify({
        p_project_id: projectId,
        p_title: input.title,
        p_kind: input.kind || "artifact",
        p_uri: input.uri ?? null,
        p_version_id: input.versionId || null,
        p_metadata: input.metadata || {},
        p_actor_type: actor.actorType,
        p_actor_id: actor.actorId,
      }),
    }
  );
  if (!ok || !data) throwRpcError(data, text, status);
  return mapDeliverable(data);
}

export async function fetchProjectById(id: string): Promise<Project | null> {
  const { ok, data, text, status } = await rest<DbProject[]>(
    "projects?id=eq." + encodeURIComponent(id) + "&select=*&limit=1"
  );
  if (!ok) {
    throw new ProjectEngineError(
      "persistence_error",
      "project_fetch_failed:" + status + ":" + text.slice(0, 120)
    );
  }
  if (!data?.[0]) return null;
  return mapProject(data[0]);
}

export async function listProjects(
  filter: ListProjectsFilter = {}
): Promise<Project[]> {
  const limit = Math.min(Math.max(filter.limit ?? 50, 1), 200);
  const offset = Math.max(filter.offset ?? 0, 0);
  const parts = [
    "select=*",
    "order=created_at.desc",
    `limit=${limit}`,
    `offset=${offset}`,
  ];
  if (filter.status) {
    parts.push("status=eq." + encodeURIComponent(filter.status));
  }
  if (filter.clientId) {
    parts.push("client_id=eq." + encodeURIComponent(filter.clientId));
  }
  const { ok, data, text, status } = await rest<DbProject[]>(
    "projects?" + parts.join("&")
  );
  if (!ok || !data) {
    throw new ProjectEngineError(
      "persistence_error",
      "project_list_failed:" + status + ":" + text.slice(0, 120)
    );
  }
  return data.map(mapProject);
}

export async function fetchVersion(
  projectId: string,
  versionId: string
): Promise<ProjectVersion | null> {
  const { ok, data, status, text } = await rest<DbVersion[]>(
    "project_versions?id=eq." +
      encodeURIComponent(versionId) +
      "&project_id=eq." +
      encodeURIComponent(projectId) +
      "&select=*&limit=1"
  );
  if (!ok) {
    throw new ProjectEngineError(
      "persistence_error",
      "version_fetch_failed:" + status + ":" + text.slice(0, 120)
    );
  }
  if (!data?.[0]) return null;
  return mapVersion(data[0]);
}

export async function listTimeline(
  projectId: string,
  limit = 100
): Promise<ProjectEvent[]> {
  const capped = Math.min(Math.max(limit, 1), 500);
  const { ok, data, status, text } = await rest<DbEvent[]>(
    "project_events?project_id=eq." +
      encodeURIComponent(projectId) +
      "&select=*&order=created_at.desc&limit=" +
      capped
  );
  if (!ok || !data) {
    throw new ProjectEngineError(
      "persistence_error",
      "timeline_failed:" + status + ":" + text.slice(0, 120)
    );
  }
  return data.map(mapEvent);
}
