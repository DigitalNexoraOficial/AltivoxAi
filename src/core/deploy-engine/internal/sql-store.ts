/**
 * @internal Supabase persistence for Deploy Engine (ADR-017).
 */

import { DeployError } from "../errors";
import type { DeploymentStatus } from "../states";
import type {
  DeployDeliverableRef,
  Deployment,
  DeploymentEvent,
} from "../types";
import type { ActorRef, DeployStore } from "./repository";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://soeyfivsuwohuuzgfqar.supabase.co";

function serviceKey(): string {
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!key) {
    throw new DeployError("persistence_error", "missing_service_role");
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
    throw new DeployError("persistence_error", `supabase_${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function mapDeployment(row: Record<string, unknown>): Deployment {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    versionId: String(row.version_id),
    status: row.status as DeploymentStatus,
    packageUri: row.package_uri ? String(row.package_uri) : null,
    error: row.error ? String(row.error) : null,
    config: (row.config as Record<string, unknown>) || {},
    deliverables: (row.deliverables as DeployDeliverableRef[]) || [],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    createdBy: row.created_by ? String(row.created_by) : null,
    createdByType: row.created_by_type ? String(row.created_by_type) : null,
  };
}

function mapEvent(row: Record<string, unknown>): DeploymentEvent {
  return {
    id: String(row.id),
    deploymentId: String(row.deployment_id),
    event: String(row.event),
    metadata: (row.metadata as Record<string, unknown>) || {},
    createdAt: String(row.created_at),
  };
}

export function createSqlDeployStore(): DeployStore {
  return {
    async createDeployment(input) {
      const rows = await rest<Record<string, unknown>[]>("deployments", {
        method: "POST",
        prefer: "return=representation",
        body: JSON.stringify({
          project_id: input.projectId,
          version_id: input.versionId,
          status: "draft",
          config: input.config,
          deliverables: input.deliverables,
          created_by: input.actor.actorId,
          created_by_type: input.actor.actorType,
        }),
      });
      return mapDeployment(rows[0]);
    },

    async getDeployment(id) {
      const rows = await rest<Record<string, unknown>[]>(
        `deployments?id=eq.${encodeURIComponent(id)}&select=*&limit=1`
      );
      return rows[0] ? mapDeployment(rows[0]) : null;
    },

    async listDeployments(filter) {
      let path = "deployments?select=*&order=created_at.desc";
      if (filter?.projectId) {
        path = `deployments?project_id=eq.${encodeURIComponent(filter.projectId)}&select=*&order=created_at.desc`;
      }
      const rows = await rest<Record<string, unknown>[]>(path);
      return rows.map(mapDeployment);
    },

    async updateStatus(id, from, to, patch) {
      const body: Record<string, unknown> = {
        status: to,
        updated_at: new Date().toISOString(),
      };
      if (patch?.packageUri !== undefined) body.package_uri = patch.packageUri;
      if (patch?.error !== undefined) body.error = patch.error;

      const rows = await rest<Record<string, unknown>[]>(
        `deployments?id=eq.${encodeURIComponent(id)}&status=eq.${encodeURIComponent(from)}`,
        {
          method: "PATCH",
          prefer: "return=representation",
          body: JSON.stringify(body),
        }
      );
      if (!rows[0]) {
        throw new DeployError("conflict", "deployment_status_conflict", 409);
      }
      return mapDeployment(rows[0]);
    },

    async updateConfig(id, config) {
      const rows = await rest<Record<string, unknown>[]>(
        `deployments?id=eq.${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          prefer: "return=representation",
          body: JSON.stringify({
            config,
            updated_at: new Date().toISOString(),
          }),
        }
      );
      if (!rows[0]) throw new DeployError("not_found", "deployment_not_found");
      return mapDeployment(rows[0]);
    },

    async appendEvent(deploymentId, event, metadata = {}) {
      const rows = await rest<Record<string, unknown>[]>("deployment_events", {
        method: "POST",
        prefer: "return=representation",
        body: JSON.stringify({
          deployment_id: deploymentId,
          event,
          metadata,
        }),
      });
      return mapEvent(rows[0]);
    },

    async listEvents(deploymentId) {
      const rows = await rest<Record<string, unknown>[]>(
        `deployment_events?deployment_id=eq.${encodeURIComponent(deploymentId)}&select=*&order=created_at.asc`
      );
      return rows.map(mapEvent);
    },
  };
}
