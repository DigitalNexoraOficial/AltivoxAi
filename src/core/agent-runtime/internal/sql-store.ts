/**
 * @internal Optional Supabase persistence for Agent Runtime (ADR-015).
 * Selected when SUPABASE_SERVICE_ROLE_KEY is set and ALTIVOX_SELFTEST is not "1".
 * Use-cases must never import this from JARVIS — only via getAgentStore().
 */

import { AgentError } from "../errors";
import type { AgentRunStatus } from "../states";
import type {
  AgentManifest,
  AgentRecord,
  AgentRun,
  AgentRunFact,
} from "../types";
import type { ActorRef, AgentStore } from "./store";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://soeyfivsuwohuuzgfqar.supabase.co";

function serviceKey(): string {
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!key) {
    throw new AgentError("persistence_error", "missing_service_role");
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
  });
  if (!res.ok) {
    throw new AgentError("persistence_error", `supabase_${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function mapAgent(row: Record<string, unknown>): AgentRecord {
  return {
    id: String(row.id),
    name: String(row.name),
    moduleId: String(row.module_id),
    capabilities: (row.capabilities as string[]) || [],
    tools: (row.tools as string[]) || [],
    prompt: String(row.prompt || ""),
    enabled: Boolean(row.enabled),
    metadata: (row.metadata as Record<string, unknown>) || {},
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    createdBy: row.created_by ? String(row.created_by) : null,
  };
}

function mapRun(row: Record<string, unknown>): AgentRun {
  return {
    id: String(row.id),
    agentId: String(row.agent_id),
    projectId: row.project_id ? String(row.project_id) : null,
    status: row.status as AgentRunStatus,
    input: (row.input as Record<string, unknown>) || {},
    result: (row.result as Record<string, unknown>) || null,
    error: row.error ? String(row.error) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    createdBy: row.created_by ? String(row.created_by) : null,
    createdByType: row.created_by_type ? String(row.created_by_type) : null,
  };
}

export function createSqlAgentStore(): AgentStore {
  return {
    async upsertAgent(manifest: AgentManifest, actor: ActorRef) {
      const rows = await rest<Record<string, unknown>[]>(
        "agents?on_conflict=id",
        {
          method: "POST",
          prefer: "resolution=merge-duplicates,return=representation",
          body: JSON.stringify({
            id: manifest.id,
            name: manifest.name,
            module_id: manifest.moduleId,
            capabilities: manifest.capabilities,
            tools: manifest.tools,
            prompt: manifest.prompt,
            enabled: manifest.enabled,
            metadata: manifest.metadata ?? {},
            updated_at: new Date().toISOString(),
            created_by: actor.actorId,
          }),
        }
      );
      return mapAgent(rows[0]);
    },
    async getAgent(id: string) {
      const rows = await rest<Record<string, unknown>[]>(
        `agents?id=eq.${encodeURIComponent(id)}&select=*&limit=1`
      );
      return rows[0] ? mapAgent(rows[0]) : null;
    },
    async listAgents() {
      const rows = await rest<Record<string, unknown>[]>(
        "agents?select=*&order=id"
      );
      return rows.map(mapAgent);
    },
    async deleteAgent(id: string) {
      await rest(`agents?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
      return true;
    },
    async createRun(input, actor) {
      const rows = await rest<Record<string, unknown>[]>(
        "agent_runs",
        {
          method: "POST",
          prefer: "return=representation",
          body: JSON.stringify({
            agent_id: input.agentId,
            project_id: input.projectId,
            status: "queued",
            input: input.input,
            created_by: actor.actorId,
            created_by_type: actor.actorType,
          }),
        }
      );
      return mapRun(rows[0]);
    },
    async getRun(id: string) {
      const rows = await rest<Record<string, unknown>[]>(
        `agent_runs?id=eq.${encodeURIComponent(id)}&select=*&limit=1`
      );
      return rows[0] ? mapRun(rows[0]) : null;
    },
    async updateRunStatus(id, from, to, patch) {
      const rows = await rest<Record<string, unknown>[]>(
        `agent_runs?id=eq.${encodeURIComponent(id)}&status=eq.${from}`,
        {
          method: "PATCH",
          prefer: "return=representation",
          body: JSON.stringify({
            status: to,
            updated_at: new Date().toISOString(),
            ...(patch?.result !== undefined ? { result: patch.result } : {}),
            ...(patch?.error !== undefined ? { error: patch.error } : {}),
          }),
        }
      );
      if (!rows[0]) throw new AgentError("conflict", "run_status_conflict", 409);
      return mapRun(rows[0]);
    },
    async appendFact(runId, kind, payload) {
      const rows = await rest<Record<string, unknown>[]>(
        "agent_run_facts",
        {
          method: "POST",
          prefer: "return=representation",
          body: JSON.stringify({
            run_id: runId,
            kind,
            payload,
          }),
        }
      );
      const row = rows[0];
      return {
        id: String(row.id),
        runId: String(row.run_id),
        kind: String(row.kind),
        payload: (row.payload as Record<string, unknown>) || {},
        createdAt: String(row.created_at),
      } satisfies AgentRunFact;
    },
    async listFacts(runId: string) {
      const rows = await rest<Record<string, unknown>[]>(
        `agent_run_facts?run_id=eq.${encodeURIComponent(runId)}&select=*&order=created_at`
      );
      return rows.map((row) => ({
        id: String(row.id),
        runId: String(row.run_id),
        kind: String(row.kind),
        payload: (row.payload as Record<string, unknown>) || {},
        createdAt: String(row.created_at),
      }));
    },
  };
}
