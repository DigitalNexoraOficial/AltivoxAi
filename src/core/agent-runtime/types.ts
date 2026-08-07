/**
 * Domain types — Agent Manager / Runtime (Bloque 5 · ADR-015).
 */

import type { AgentRunStatus } from "./states";

export type AgentManifest = {
  id: string;
  name: string;
  moduleId: string;
  capabilities: string[];
  tools: string[];
  prompt: string;
  enabled: boolean;
  metadata?: Record<string, unknown>;
};

export type AgentRecord = AgentManifest & {
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
};

export type AgentRun = {
  id: string;
  agentId: string;
  projectId: string | null;
  status: AgentRunStatus;
  input: Record<string, unknown>;
  result: Record<string, unknown> | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  createdByType: string | null;
};

export type AgentRunFact = {
  id: string;
  runId: string;
  kind: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type CreateRunInput = {
  agentId: string;
  projectId?: string | null;
  input?: Record<string, unknown>;
};
