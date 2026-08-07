/**
 * Domain types — Deploy Engine (Bloque 7 · ADR-017).
 */

import type { DeploymentStatus } from "./states";

/** Client/ops-safe deliverable ref for ZIP packaging (no agents/prompts). */
export type DeployDeliverableRef = {
  deliverableId: string;
  title: string;
  kind: string;
  uri: string | null;
  /** Optional inline text payload for ZIP (never secrets). */
  content?: string | null;
};

export type Deployment = {
  id: string;
  projectId: string;
  versionId: string;
  status: DeploymentStatus;
  packageUri: string | null;
  error: string | null;
  config: Record<string, unknown>;
  deliverables: DeployDeliverableRef[];
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  createdByType: string | null;
};

export type DeploymentEvent = {
  id: string;
  deploymentId: string;
  event: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type CreateDeploymentInput = {
  projectId: string;
  versionId: string;
  /** Snapshot of deliverables to package (OPS supplies; no Review import). */
  deliverables?: DeployDeliverableRef[];
  config?: Record<string, unknown>;
};

export type ConfigureDeploymentInput = {
  config?: Record<string, unknown>;
};

export type DeploymentView = {
  deployment: Deployment;
  events: DeploymentEvent[];
};
