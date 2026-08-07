/**
 * In-memory + optional SQL persistence for Agent Runtime (Bloque 5).
 * Selftests use memory (ALTIVOX_SELFTEST=1). Prod uses SQL when service role is set.
 */

import { randomUUID } from "node:crypto";
import { AgentError } from "../errors";
import type { AgentRunStatus } from "../states";
import type {
  AgentManifest,
  AgentRecord,
  AgentRun,
  AgentRunFact,
} from "../types";
import { createSqlAgentStore } from "./sql-store";

function now() {
  return new Date().toISOString();
}

export type ActorRef = { actorType: string; actorId: string };

export type AgentStore = {
  upsertAgent(manifest: AgentManifest, actor: ActorRef): Promise<AgentRecord>;
  getAgent(id: string): Promise<AgentRecord | null>;
  listAgents(): Promise<AgentRecord[]>;
  deleteAgent(id: string): Promise<boolean>;
  createRun(
    input: {
      agentId: string;
      projectId: string | null;
      input: Record<string, unknown>;
    },
    actor: ActorRef
  ): Promise<AgentRun>;
  getRun(id: string): Promise<AgentRun | null>;
  updateRunStatus(
    id: string,
    from: AgentRunStatus,
    to: AgentRunStatus,
    patch?: { result?: Record<string, unknown> | null; error?: string | null }
  ): Promise<AgentRun>;
  appendFact(
    runId: string,
    kind: string,
    payload: Record<string, unknown>
  ): Promise<AgentRunFact>;
  listFacts(runId: string): Promise<AgentRunFact[]>;
};

export function createMemoryAgentStore(): AgentStore {
  const agents = new Map<string, AgentRecord>();
  const runs = new Map<string, AgentRun>();
  const facts = new Map<string, AgentRunFact[]>();

  return {
    async upsertAgent(manifest, actor) {
      const existing = agents.get(manifest.id);
      const ts = now();
      const record: AgentRecord = {
        ...manifest,
        metadata: manifest.metadata ?? {},
        createdAt: existing?.createdAt ?? ts,
        updatedAt: ts,
        createdBy: existing?.createdBy ?? actor.actorId,
      };
      agents.set(manifest.id, record);
      return record;
    },
    async getAgent(id) {
      return agents.get(id) ?? null;
    },
    async listAgents() {
      return [...agents.values()];
    },
    async deleteAgent(id) {
      return agents.delete(id);
    },
    async createRun(input, actor) {
      const ts = now();
      const run: AgentRun = {
        id: randomUUID(),
        agentId: input.agentId,
        projectId: input.projectId,
        status: "queued",
        input: input.input,
        result: null,
        error: null,
        createdAt: ts,
        updatedAt: ts,
        createdBy: actor.actorId,
        createdByType: actor.actorType,
      };
      runs.set(run.id, run);
      facts.set(run.id, []);
      return run;
    },
    async getRun(id) {
      return runs.get(id) ?? null;
    },
    async updateRunStatus(id, from, to, patch) {
      const run = runs.get(id);
      if (!run) throw new AgentError("not_found", "run_not_found");
      if (run.status !== from) {
        throw new AgentError("conflict", "run_status_conflict", 409);
      }
      const next: AgentRun = {
        ...run,
        status: to,
        updatedAt: now(),
        result: patch?.result !== undefined ? patch.result : run.result,
        error: patch?.error !== undefined ? patch.error : run.error,
      };
      runs.set(id, next);
      return next;
    },
    async appendFact(runId, kind, payload) {
      if (!runs.has(runId)) throw new AgentError("not_found", "run_not_found");
      const fact: AgentRunFact = {
        id: randomUUID(),
        runId,
        kind,
        payload,
        createdAt: now(),
      };
      const list = facts.get(runId) ?? [];
      list.push(fact);
      facts.set(runId, list);
      return fact;
    },
    async listFacts(runId) {
      return [...(facts.get(runId) ?? [])];
    },
  };
}

let activeStore: AgentStore = createMemoryAgentStore();
let sqlStore: AgentStore | null = null;

function shouldUseSql(): boolean {
  if (process.env.ALTIVOX_SELFTEST === "1") return false;
  if (process.env.ALTIVOX_AGENT_STORE === "memory") return false;
  return Boolean(String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim());
}

export function getAgentStore(): AgentStore {
  if (shouldUseSql()) {
    if (!sqlStore) sqlStore = createSqlAgentStore();
    return sqlStore;
  }
  return activeStore;
}

/** Selftests only — swap persistence. */
export function setAgentStoreForTests(store: AgentStore | null): void {
  activeStore = store ?? createMemoryAgentStore();
}

export function resetAgentStoreForTests(): void {
  activeStore = createMemoryAgentStore();
}
