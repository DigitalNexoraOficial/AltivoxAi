/**
 * Client helpers for /api/ops/* — cookie session, no Supabase, no domain logic.
 */

export type OpsUser = {
  id: string;
  email?: string;
  role: string;
  permissions: string[];
};

export type OpsProject = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  serviceType: string;
  status: string;
  clientId: string | null;
  leadId: string | null;
  description: string;
  metadata: Record<string, unknown>;
  createdBy: string | null;
  updatedBy: string | null;
};

export type OpsVersion = {
  id: string;
  projectId: string;
  label: string;
  notes: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  createdBy: string | null;
};

export type OpsDeliverable = {
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

export type OpsEvent = {
  id: string;
  projectId: string;
  createdAt: string;
  eventType: string;
  actorType: string | null;
  actorId: string | null;
  payload: Record<string, unknown>;
};

export class OpsApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message?: string) {
    super(message || code);
    this.name = "OpsApiError";
    this.status = status;
    this.code = code;
  }
}

async function parseJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function opsFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const body = await parseJson(res);
  if (!res.ok) {
    const code =
      typeof body.error === "string" ? body.error : `http_${res.status}`;
    const message =
      typeof body.message === "string" ? body.message : code;
    throw new OpsApiError(res.status, code, message);
  }
  return body as T;
}

export function hasPermission(
  user: OpsUser | null | undefined,
  action: string
): boolean {
  if (!user?.permissions?.length) return false;
  return user.permissions.includes(action);
}

export async function fetchOpsSession(): Promise<OpsUser> {
  const data = await opsFetch<{ ok: boolean; user: OpsUser }>(
    "/api/ops/session"
  );
  return data.user;
}

export async function clearOpsSession(): Promise<void> {
  await opsFetch("/api/ops/session", { method: "DELETE" });
}

export async function listProjects(params?: {
  status?: string;
}): Promise<OpsProject[]> {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  const qs = q.toString();
  const data = await opsFetch<{ projects: OpsProject[] }>(
    "/api/ops/projects" + (qs ? `?${qs}` : "")
  );
  return data.projects;
}

export async function createProject(input: {
  name: string;
  serviceType: string;
  description?: string;
}): Promise<OpsProject> {
  const data = await opsFetch<{ project: OpsProject }>("/api/ops/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.project;
}

export async function getProject(id: string): Promise<OpsProject> {
  const data = await opsFetch<{ project: OpsProject }>(
    `/api/ops/projects/${encodeURIComponent(id)}`
  );
  return data.project;
}

export async function updateProjectMeta(
  id: string,
  patch: Record<string, unknown>
): Promise<OpsProject> {
  const data = await opsFetch<{ project: OpsProject }>(
    `/api/ops/projects/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(patch) }
  );
  return data.project;
}

export async function transitionProject(
  id: string,
  status: string
): Promise<OpsProject> {
  const data = await opsFetch<{ project: OpsProject }>(
    `/api/ops/projects/${encodeURIComponent(id)}/transition`,
    { method: "POST", body: JSON.stringify({ status }) }
  );
  return data.project;
}

export async function createVersion(
  id: string,
  input: { label: string; notes?: string }
): Promise<OpsVersion> {
  const data = await opsFetch<{ version: OpsVersion }>(
    `/api/ops/projects/${encodeURIComponent(id)}/versions`,
    { method: "POST", body: JSON.stringify(input) }
  );
  return data.version;
}

export async function registerDeliverable(
  id: string,
  input: {
    title: string;
    kind?: string;
    uri?: string | null;
    versionId?: string | null;
  }
): Promise<OpsDeliverable> {
  const data = await opsFetch<{ deliverable: OpsDeliverable }>(
    `/api/ops/projects/${encodeURIComponent(id)}/deliverables`,
    { method: "POST", body: JSON.stringify(input) }
  );
  return data.deliverable;
}

export async function listTimeline(id: string): Promise<OpsEvent[]> {
  const data = await opsFetch<{ events: OpsEvent[] }>(
    `/api/ops/projects/${encodeURIComponent(id)}/timeline`
  );
  return data.events;
}

export type OpsReviewSession = {
  id: string;
  projectId: string;
  versionId: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  revokedAt: string | null;
};

export type OpsReviewCreateResult = {
  review: OpsReviewSession;
  token?: string;
  portalPath?: string;
  deliverables: Array<{
    deliverableId: string;
    title: string;
    kind: string;
    uri: string | null;
  }>;
};

export async function listReviews(
  projectId: string
): Promise<OpsReviewSession[]> {
  const data = await opsFetch<{ reviews: OpsReviewSession[] }>(
    `/api/ops/reviews?projectId=${encodeURIComponent(projectId)}`
  );
  return data.reviews;
}

export async function createReview(input: {
  projectId: string;
  versionId: string;
  deliverables: Array<{
    deliverableId: string;
    title: string;
    kind?: string;
    uri?: string | null;
  }>;
  expiresAt?: string;
}): Promise<OpsReviewCreateResult> {
  return opsFetch<OpsReviewCreateResult>("/api/ops/reviews", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function revokeReview(
  reviewId: string
): Promise<OpsReviewCreateResult> {
  return opsFetch<OpsReviewCreateResult>(
    `/api/ops/reviews/${encodeURIComponent(reviewId)}`,
    { method: "POST" }
  );
}

/** Catalog of statuses accepted by PE APIs (display only — server enforces transitions). */
export const OPS_PROJECT_STATUSES = [
  "draft",
  "planning",
  "in_progress",
  "qa",
  "review",
  "approved",
  "delivered",
  "maintenance",
  "cancelled",
  "archived",
] as const;

/** Suggested service labels for Ops forms (free-text in PE — not auto-build). */
export const OPS_SERVICE_TYPE_HINTS = [
  { value: "web", label: "Web (sitio / landing)" },
  { value: "chatbot", label: "Chatbot (etiqueta — no auto-genera)" },
  { value: "automation", label: "Automatización (etiqueta — no auto-genera)" },
] as const;

export type OpsClient = {
  id: string;
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  estado: string;
  origen: string;
  leadId: string | null;
  notas: string;
};

export type OpsLead = {
  id: string;
  nombre: string;
  email: string;
  empresa: string;
  telefono: string;
  mensaje: string;
  tipoInteres: string;
  fuente: string;
  estado: string;
  createdAt: string;
};

export type OpsEncargo = {
  id: string;
  clientId: string;
  clientName: string;
  leadId: string | null;
  serviceKey: string;
  serviceLabel: string;
  description: string;
  status: string;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OpsEncargoStep = {
  id: string;
  encargoId: string;
  sortOrder: number;
  role: string;
  agentId: string;
  status: string;
  proposal: string;
  output: string;
  runId: string | null;
};

export type OpsEncargoView = {
  encargo: OpsEncargo;
  steps: OpsEncargoStep[];
};

export type OpsEncargoService = {
  key: string;
  label: string;
  hint: string;
};

export async function listClients(): Promise<OpsClient[]> {
  const data = await opsFetch<{ clients: OpsClient[] }>("/api/ops/clientes");
  return data.clients;
}

export async function listLeads(): Promise<OpsLead[]> {
  const data = await opsFetch<{ leads: OpsLead[] }>("/api/ops/leads");
  return data.leads;
}

export async function listEncargos(): Promise<{
  encargos: OpsEncargo[];
  services: OpsEncargoService[];
}> {
  return opsFetch("/api/ops/encargos");
}

export async function createEncargo(input: {
  clientId: string;
  clientName: string;
  leadId?: string | null;
  serviceKey: string;
  description: string;
}): Promise<OpsEncargoView> {
  return opsFetch("/api/ops/encargos", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getEncargo(id: string): Promise<OpsEncargoView> {
  return opsFetch(`/api/ops/encargos/${encodeURIComponent(id)}`);
}

export async function continueEncargo(id: string): Promise<OpsEncargoView> {
  return opsFetch(`/api/ops/encargos/${encodeURIComponent(id)}/continue`, {
    method: "POST",
  });
}

export async function approveEncargoStep(
  encargoId: string,
  stepId: string
): Promise<OpsEncargoView> {
  return opsFetch(
    `/api/ops/encargos/${encodeURIComponent(encargoId)}/steps/${encodeURIComponent(stepId)}/approve`,
    { method: "POST" }
  );
}

export async function rejectEncargoStep(
  encargoId: string,
  stepId: string
): Promise<OpsEncargoView> {
  return opsFetch(
    `/api/ops/encargos/${encodeURIComponent(encargoId)}/steps/${encodeURIComponent(stepId)}/reject`,
    { method: "POST" }
  );
}

export async function proposeEncargoStep(
  encargoId: string,
  stepId: string
): Promise<OpsEncargoView> {
  return opsFetch(
    `/api/ops/encargos/${encodeURIComponent(encargoId)}/steps/${encodeURIComponent(stepId)}/propose`,
    { method: "POST" }
  );
}
