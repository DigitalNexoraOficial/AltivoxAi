/**
 * @internal Encargo persistence — memory (selftest) + Supabase SQL.
 */

import { EncargoError } from "../errors";
import type {
  Encargo,
  EncargoServiceKey,
  EncargoStatus,
  EncargoStep,
  EncargoStepRole,
  EncargoStepStatus,
} from "../types";
import { agentIdForRole, ENCARGO_STEP_ROLES, serviceLabelFor } from "../types";

export type EncargoStore = {
  createEncargo(input: {
    clientId: string;
    clientName: string;
    leadId: string | null;
    serviceKey: EncargoServiceKey;
    description: string;
    actorId: string | null;
  }): Promise<Encargo>;
  getEncargo(id: string): Promise<Encargo | null>;
  updateEncargo(
    id: string,
    patch: Partial<{
      description: string;
      serviceKey: EncargoServiceKey;
      serviceLabel: string;
      status: EncargoStatus;
      projectId: string | null;
    }>
  ): Promise<Encargo>;
  listEncargos(): Promise<Encargo[]>;
  seedSteps(encargoId: string): Promise<EncargoStep[]>;
  listSteps(encargoId: string): Promise<EncargoStep[]>;
  getStep(stepId: string): Promise<EncargoStep | null>;
  updateStep(
    stepId: string,
    patch: Partial<{
      status: EncargoStepStatus;
      proposal: string;
      output: string;
      runId: string | null;
    }>
  ): Promise<EncargoStep>;
};

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://soeyfivsuwohuuzgfqar.supabase.co";

function serviceKey(): string {
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!key) {
    throw new EncargoError("persistence_error", "missing_service_role");
  }
  return key;
}

async function rest<T>(
  path: string,
  init: RequestInit & { prefer?: string } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    apikey: serviceKey(),
    Authorization: `Bearer ${serviceKey()}`,
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (init.prefer) headers.Prefer = init.prefer;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  const raw = await res.text();
  let data: unknown = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      throw new EncargoError(
        "persistence_error",
        `supabase_bad_json_${res.status}`
      );
    }
  }
  if (!res.ok) {
    const detail =
      data && typeof data === "object" && !Array.isArray(data)
        ? String(
            (data as { message?: string }).message ||
              (data as { code?: string }).code ||
              ""
          ).slice(0, 160)
        : "";
    throw new EncargoError(
      "persistence_error",
      detail ? `supabase_${res.status}:${detail}` : `supabase_${res.status}`
    );
  }
  return data as T;
}

function asRows(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (data && typeof data === "object") return [data as Record<string, unknown>];
  return [];
}

function mapEncargo(row: Record<string, unknown>): Encargo {
  return {
    id: String(row.id),
    clientId: String(row.client_id),
    clientName: String(row.client_name || ""),
    leadId: row.lead_id ? String(row.lead_id) : null,
    serviceKey: String(row.service_key) as EncargoServiceKey,
    serviceLabel: String(row.service_label || ""),
    description: String(row.description || ""),
    status: row.status as EncargoStatus,
    projectId: row.project_id ? String(row.project_id) : null,
    createdBy: row.created_by ? String(row.created_by) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapStep(row: Record<string, unknown>): EncargoStep {
  return {
    id: String(row.id),
    encargoId: String(row.encargo_id),
    sortOrder: Number(row.sort_order || 0),
    role: String(row.role) as EncargoStepRole,
    agentId: String(row.agent_id),
    status: row.status as EncargoStepStatus,
    proposal: String(row.proposal || ""),
    output: String(row.output || ""),
    runId: row.run_id ? String(row.run_id) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function createMemoryEncargoStore(): EncargoStore {
  const encargos = new Map<string, Encargo>();
  const steps = new Map<string, EncargoStep>();

  return {
    async createEncargo(input) {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const row: Encargo = {
        id,
        clientId: input.clientId,
        clientName: input.clientName,
        leadId: input.leadId,
        serviceKey: input.serviceKey,
        serviceLabel: serviceLabelFor(input.serviceKey),
        description: input.description,
        status: "draft",
        projectId: null,
        createdBy: input.actorId,
        createdAt: now,
        updatedAt: now,
      };
      encargos.set(id, row);
      return row;
    },
    async getEncargo(id) {
      return encargos.get(id) || null;
    },
    async updateEncargo(id, patch) {
      const cur = encargos.get(id);
      if (!cur) throw new EncargoError("not_found", "encargo_not_found", 404);
      const next: Encargo = {
        ...cur,
        ...patch,
        serviceLabel: patch.serviceKey
          ? serviceLabelFor(patch.serviceKey)
          : patch.serviceLabel ?? cur.serviceLabel,
        updatedAt: new Date().toISOString(),
      };
      encargos.set(id, next);
      return next;
    },
    async listEncargos() {
      return [...encargos.values()].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      );
    },
    async seedSteps(encargoId) {
      const now = new Date().toISOString();
      const created: EncargoStep[] = [];
      ENCARGO_STEP_ROLES.forEach((role, i) => {
        const id = crypto.randomUUID();
        const step: EncargoStep = {
          id,
          encargoId,
          sortOrder: i,
          role,
          agentId: agentIdForRole(role),
          status: "pending",
          proposal: "",
          output: "",
          runId: null,
          createdAt: now,
          updatedAt: now,
        };
        steps.set(id, step);
        created.push(step);
      });
      return created;
    },
    async listSteps(encargoId) {
      return [...steps.values()]
        .filter((s) => s.encargoId === encargoId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    },
    async getStep(stepId) {
      return steps.get(stepId) || null;
    },
    async updateStep(stepId, patch) {
      const cur = steps.get(stepId);
      if (!cur) throw new EncargoError("not_found", "step_not_found", 404);
      const next = {
        ...cur,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      steps.set(stepId, next);
      return next;
    },
  };
}

export function createSqlEncargoStore(): EncargoStore {
  return {
    async createEncargo(input) {
      const inserted = await rest<unknown>("ops_encargos", {
        method: "POST",
        prefer: "return=representation",
        body: JSON.stringify({
          client_id: input.clientId,
          client_name: input.clientName,
          lead_id: input.leadId,
          service_key: input.serviceKey,
          service_label: serviceLabelFor(input.serviceKey),
          description: input.description,
          status: "draft",
          created_by: input.actorId,
        }),
      });
      const row = asRows(inserted)[0];
      if (!row) throw new EncargoError("persistence_error", "encargo_insert_empty");
      return mapEncargo(row);
    },
    async getEncargo(id) {
      const rows = asRows(
        await rest<unknown>(
          `ops_encargos?id=eq.${encodeURIComponent(id)}&select=*&limit=1`
        )
      );
      return rows[0] ? mapEncargo(rows[0]) : null;
    },
    async updateEncargo(id, patch) {
      const body: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (patch.description !== undefined) body.description = patch.description;
      if (patch.serviceKey !== undefined) {
        body.service_key = patch.serviceKey;
        body.service_label = serviceLabelFor(patch.serviceKey);
      }
      if (patch.serviceLabel !== undefined) body.service_label = patch.serviceLabel;
      if (patch.status !== undefined) body.status = patch.status;
      if (patch.projectId !== undefined) body.project_id = patch.projectId;
      const rows = asRows(
        await rest<unknown>(`ops_encargos?id=eq.${encodeURIComponent(id)}`, {
          method: "PATCH",
          prefer: "return=representation",
          body: JSON.stringify(body),
        })
      );
      if (!rows[0]) throw new EncargoError("not_found", "encargo_not_found", 404);
      return mapEncargo(rows[0]);
    },
    async listEncargos() {
      const rows = asRows(
        await rest<unknown>("ops_encargos?select=*&order=created_at.desc")
      );
      return rows.map(mapEncargo);
    },
    async seedSteps(encargoId) {
      const payload = ENCARGO_STEP_ROLES.map((role, i) => ({
        encargo_id: encargoId,
        sort_order: i,
        role,
        agent_id: agentIdForRole(role),
        status: "pending",
        proposal: "",
        output: "",
      }));
      const inserted = await rest<unknown>("ops_encargo_steps", {
        method: "POST",
        prefer: "return=representation",
        body: JSON.stringify(payload),
      });
      return asRows(inserted).map(mapStep).sort((a, b) => a.sortOrder - b.sortOrder);
    },
    async listSteps(encargoId) {
      const rows = asRows(
        await rest<unknown>(
          `ops_encargo_steps?encargo_id=eq.${encodeURIComponent(encargoId)}&select=*&order=sort_order.asc`
        )
      );
      return rows.map(mapStep);
    },
    async getStep(stepId) {
      const rows = asRows(
        await rest<unknown>(
          `ops_encargo_steps?id=eq.${encodeURIComponent(stepId)}&select=*&limit=1`
        )
      );
      return rows[0] ? mapStep(rows[0]) : null;
    },
    async updateStep(stepId, patch) {
      const body: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (patch.status !== undefined) body.status = patch.status;
      if (patch.proposal !== undefined) body.proposal = patch.proposal;
      if (patch.output !== undefined) body.output = patch.output;
      if (patch.runId !== undefined) body.run_id = patch.runId;
      const rows = asRows(
        await rest<unknown>(
          `ops_encargo_steps?id=eq.${encodeURIComponent(stepId)}`,
          {
            method: "PATCH",
            prefer: "return=representation",
            body: JSON.stringify(body),
          }
        )
      );
      if (!rows[0]) throw new EncargoError("not_found", "step_not_found", 404);
      return mapStep(rows[0]);
    },
  };
}

let active: EncargoStore = createMemoryEncargoStore();
let sql: EncargoStore | null = null;

function shouldUseSql(): boolean {
  if (process.env.ALTIVOX_SELFTEST === "1") return false;
  if (process.env.ALTIVOX_ENCARGO_STORE === "memory") return false;
  return Boolean(String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim());
}

export function getEncargoStore(): EncargoStore {
  if (shouldUseSql()) {
    if (!sql) sql = createSqlEncargoStore();
    return sql;
  }
  return active;
}

export function setEncargoStoreForTests(store: EncargoStore | null): void {
  active = store ?? createMemoryEncargoStore();
}

export function resetEncargoStoreForTests(): void {
  active = createMemoryEncargoStore();
}
