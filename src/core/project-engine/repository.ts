/**
 * Persistence for Project Engine via Supabase REST (service role).
 * Authorization is enforced in use-cases via can() before any call.
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
} from "./types";
import { ProjectEngineError } from "./types";
import type { ProjectStatus } from "./states";
import { isProjectStatus } from "./states";

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

export type DomainEventInsert = {
  projectId: string;
  eventType: string;
  actorType?: string | null;
  actorId?: string | null;
  payload?: Record<string, unknown>;
};

export async function insertDomainEvent(
  event: DomainEventInsert
): Promise<ProjectEvent> {
  const { ok, status, data, text } = await rest<DbEvent[]>("project_events", {
    method: "POST",
    prefer: "return=representation",
    body: JSON.stringify({
      project_id: event.projectId,
      event_type: event.eventType,
      actor_type: event.actorType || null,
      actor_id: event.actorId || null,
      payload: event.payload || {},
    }),
  });
  if (!ok || !data?.[0]) {
    throw new ProjectEngineError(
      "persistence_error",
      "event_insert_failed:" + status + ":" + text.slice(0, 120)
    );
  }
  return mapEvent(data[0]);
}

export async function insertProject(
  input: CreateProjectInput,
  actorId: string
): Promise<Project> {
  const now = new Date().toISOString();
  const { ok, status, data, text } = await rest<DbProject[]>("projects", {
    method: "POST",
    prefer: "return=representation",
    body: JSON.stringify({
      name: input.name,
      service_type: input.serviceType,
      status: "draft",
      client_id: input.clientId || null,
      lead_id: input.leadId || null,
      description: input.description || "",
      metadata: input.metadata || {},
      created_by: actorId,
      updated_by: actorId,
      created_at: now,
      updated_at: now,
    }),
  });
  if (!ok || !data?.[0]) {
    throw new ProjectEngineError(
      "persistence_error",
      "project_insert_failed:" + status + ":" + text.slice(0, 120)
    );
  }
  return mapProject(data[0]);
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
  const parts = ["select=*", "order=created_at.desc", `limit=${limit}`, `offset=${offset}`];
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

export async function updateProjectRow(
  id: string,
  patch: UpdateProjectMetaInput & {
    status?: ProjectStatus;
    updatedBy: string;
  }
): Promise<Project> {
  const body: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    updated_by: patch.updatedBy,
  };
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.serviceType !== undefined) body.service_type = patch.serviceType;
  if (patch.clientId !== undefined) body.client_id = patch.clientId;
  if (patch.leadId !== undefined) body.lead_id = patch.leadId;
  if (patch.description !== undefined) body.description = patch.description;
  if (patch.metadata !== undefined) body.metadata = patch.metadata;
  if (patch.status !== undefined) body.status = patch.status;

  const { ok, status, data, text } = await rest<DbProject[]>(
    "projects?id=eq." + encodeURIComponent(id),
    {
      method: "PATCH",
      prefer: "return=representation",
      body: JSON.stringify(body),
    }
  );
  if (!ok || !data?.[0]) {
    throw new ProjectEngineError(
      "persistence_error",
      "project_update_failed:" + status + ":" + text.slice(0, 120)
    );
  }
  return mapProject(data[0]);
}

export async function insertVersion(
  projectId: string,
  input: CreateVersionInput,
  actorId: string
): Promise<ProjectVersion> {
  const { ok, status, data, text } = await rest<DbVersion[]>(
    "project_versions",
    {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({
        project_id: projectId,
        label: input.label,
        notes: input.notes || "",
        metadata: input.metadata || {},
        created_by: actorId,
      }),
    }
  );
  if (!ok || !data?.[0]) {
    if (status === 409 || text.toLowerCase().includes("duplicate")) {
      throw new ProjectEngineError("conflict", "version_label_exists", 409);
    }
    throw new ProjectEngineError(
      "persistence_error",
      "version_insert_failed:" + status + ":" + text.slice(0, 120)
    );
  }
  return mapVersion(data[0]);
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

export async function insertDeliverable(
  projectId: string,
  input: RegisterDeliverableInput,
  actorId: string
): Promise<Deliverable> {
  const { ok, status, data, text } = await rest<DbDeliverable[]>(
    "deliverables",
    {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({
        project_id: projectId,
        version_id: input.versionId || null,
        kind: input.kind || "artifact",
        title: input.title,
        uri: input.uri ?? null,
        metadata: input.metadata || {},
        created_by: actorId,
      }),
    }
  );
  if (!ok || !data?.[0]) {
    throw new ProjectEngineError(
      "persistence_error",
      "deliverable_insert_failed:" + status + ":" + text.slice(0, 120)
    );
  }
  return mapDeliverable(data[0]);
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
