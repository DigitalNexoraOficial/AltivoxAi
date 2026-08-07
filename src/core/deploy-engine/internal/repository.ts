/**
 * In-memory + optional SQL persistence for Deploy Engine (Bloque 7).
 */

import { randomUUID } from "node:crypto";
import { DeployError } from "../errors";
import type { DeploymentStatus } from "../states";
import type {
  DeployDeliverableRef,
  Deployment,
  DeploymentEvent,
} from "../types";
import { createSqlDeployStore } from "./sql-store";

function now() {
  return new Date().toISOString();
}

export type ActorRef = { actorType: string; actorId: string };

export type DeployStore = {
  createDeployment(input: {
    projectId: string;
    versionId: string;
    deliverables: DeployDeliverableRef[];
    config: Record<string, unknown>;
    actor: ActorRef;
  }): Promise<Deployment>;
  getDeployment(id: string): Promise<Deployment | null>;
  listDeployments(filter?: { projectId?: string }): Promise<Deployment[]>;
  updateStatus(
    id: string,
    from: DeploymentStatus,
    to: DeploymentStatus,
    patch?: { packageUri?: string | null; error?: string | null }
  ): Promise<Deployment>;
  updateConfig(
    id: string,
    config: Record<string, unknown>
  ): Promise<Deployment>;
  appendEvent(
    deploymentId: string,
    event: string,
    metadata?: Record<string, unknown>
  ): Promise<DeploymentEvent>;
  listEvents(deploymentId: string): Promise<DeploymentEvent[]>;
};

export function createMemoryDeployStore(): DeployStore {
  const deployments = new Map<string, Deployment>();
  const events = new Map<string, DeploymentEvent[]>();

  return {
    async createDeployment(input) {
      const ts = now();
      const d: Deployment = {
        id: randomUUID(),
        projectId: input.projectId,
        versionId: input.versionId,
        status: "draft",
        packageUri: null,
        error: null,
        config: { ...input.config },
        deliverables: input.deliverables.map((x) => ({ ...x })),
        createdAt: ts,
        updatedAt: ts,
        createdBy: input.actor.actorId,
        createdByType: input.actor.actorType,
      };
      deployments.set(d.id, d);
      events.set(d.id, []);
      return d;
    },
    async getDeployment(id) {
      return deployments.get(id) ?? null;
    },
    async listDeployments(filter) {
      let list = [...deployments.values()];
      if (filter?.projectId) {
        list = list.filter((d) => d.projectId === filter.projectId);
      }
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async updateStatus(id, from, to, patch) {
      const d = deployments.get(id);
      if (!d) throw new DeployError("not_found", "deployment_not_found");
      if (d.status !== from) {
        throw new DeployError("conflict", "deployment_status_conflict", 409);
      }
      const next: Deployment = {
        ...d,
        status: to,
        updatedAt: now(),
        packageUri:
          patch?.packageUri !== undefined ? patch.packageUri : d.packageUri,
        error: patch?.error !== undefined ? patch.error : d.error,
      };
      deployments.set(id, next);
      return next;
    },
    async updateConfig(id, config) {
      const d = deployments.get(id);
      if (!d) throw new DeployError("not_found", "deployment_not_found");
      const next: Deployment = {
        ...d,
        config: { ...config },
        updatedAt: now(),
      };
      deployments.set(id, next);
      return next;
    },
    async appendEvent(deploymentId, event, metadata = {}) {
      if (!deployments.has(deploymentId)) {
        throw new DeployError("not_found", "deployment_not_found");
      }
      const e: DeploymentEvent = {
        id: randomUUID(),
        deploymentId,
        event,
        metadata,
        createdAt: now(),
      };
      const list = events.get(deploymentId) ?? [];
      list.push(e);
      events.set(deploymentId, list);
      return e;
    },
    async listEvents(deploymentId) {
      return [...(events.get(deploymentId) ?? [])];
    },
  };
}

let activeStore: DeployStore = createMemoryDeployStore();
let sqlStore: DeployStore | null = null;

function shouldUseSql(): boolean {
  if (process.env.ALTIVOX_SELFTEST === "1") return false;
  if (process.env.ALTIVOX_DEPLOY_STORE === "memory") return false;
  return Boolean(String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim());
}

export function getDeployStore(): DeployStore {
  if (shouldUseSql()) {
    if (!sqlStore) sqlStore = createSqlDeployStore();
    return sqlStore;
  }
  return activeStore;
}

export function setDeployStoreForTests(store: DeployStore | null): void {
  activeStore = store ?? createMemoryDeployStore();
}

export function resetDeployStoreForTests(): void {
  activeStore = createMemoryDeployStore();
}
