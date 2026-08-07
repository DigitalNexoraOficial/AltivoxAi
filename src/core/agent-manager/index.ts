/**
 * Agent Manager — runtime de manifests (Bloque 5 · ADR-015).
 * Not a marketplace / hot-reload / arbitrary code loader.
 */

import { can, type Subject } from "@/core/security";
import { AgentError } from "@/core/agent-runtime/errors";
import { isAllowedTool } from "@/core/agent-runtime/states";
import { getAgentStore } from "@/core/agent-runtime/internal/store";
import type { AgentManifest, AgentRecord } from "@/core/agent-runtime/types";
import { knownModuleIds } from "@/modules/registry";

export interface AgentManagerBoundary {
  readonly __frontier: "AgentManagerBoundary";
}

function actor(subject: Subject) {
  return { actorType: subject.type, actorId: subject.id };
}

export function validateManifest(raw: Partial<AgentManifest>): AgentManifest {
  const id = String(raw.id || "").trim();
  const name = String(raw.name || "").trim();
  const moduleId = String(raw.moduleId || "").trim();
  const prompt = String(raw.prompt || "");
  const capabilities = Array.isArray(raw.capabilities)
    ? raw.capabilities.map((c) => String(c).trim()).filter(Boolean)
    : [];
  const tools = Array.isArray(raw.tools)
    ? raw.tools.map((t) => String(t).trim()).filter(Boolean)
    : [];

  if (!id) throw new AgentError("invalid_input", "agent_id_required");
  if (!/^[a-z0-9][a-z0-9._-]{1,63}$/i.test(id)) {
    throw new AgentError("invalid_input", "agent_id_invalid");
  }
  if (!name) throw new AgentError("invalid_input", "agent_name_required");
  if (!moduleId) throw new AgentError("invalid_input", "module_id_required");
  if (!knownModuleIds().includes(moduleId)) {
    throw new AgentError("invalid_input", `unknown_module:${moduleId}`);
  }
  if (capabilities.length === 0) {
    throw new AgentError("invalid_input", "capabilities_required");
  }
  for (const t of tools) {
    if (!isAllowedTool(t)) {
      throw new AgentError("invalid_input", `tool_not_allowed:${t}`);
    }
  }

  return {
    id,
    name,
    moduleId,
    capabilities,
    tools,
    prompt,
    enabled: raw.enabled !== false,
    metadata:
      raw.metadata && typeof raw.metadata === "object" && !Array.isArray(raw.metadata)
        ? raw.metadata
        : {},
  };
}

export async function registerAgent(
  subject: Subject,
  raw: Partial<AgentManifest>
): Promise<AgentRecord> {
  if (!can(subject, "agent.configure").allowed) {
    throw new AgentError("forbidden", "agent_configure_denied", 403);
  }
  const manifest = validateManifest(raw);
  return getAgentStore().upsertAgent(manifest, actor(subject));
}

export async function getAgent(
  subject: Subject,
  agentId: string
): Promise<AgentRecord> {
  if (
    !can(subject, "agent.execute").allowed &&
    !can(subject, "agent.configure").allowed &&
    !can(subject, "project.read").allowed
  ) {
    throw new AgentError("forbidden", "agent_read_denied", 403);
  }
  const agent = await getAgentStore().getAgent(agentId);
  if (!agent) throw new AgentError("not_found", "agent_not_found");
  return agent;
}

export async function listAgents(subject: Subject): Promise<AgentRecord[]> {
  if (
    !can(subject, "agent.execute").allowed &&
    !can(subject, "agent.configure").allowed &&
    !can(subject, "project.read").allowed
  ) {
    throw new AgentError("forbidden", "agent_list_denied", 403);
  }
  return getAgentStore().listAgents();
}

export async function resolveAgentsByCapability(
  subject: Subject,
  capability: string
): Promise<AgentRecord[]> {
  const { resolveCapability } = await import("@/core/capability-registry");
  const ids = await resolveCapability(subject, capability);
  const out: AgentRecord[] = [];
  for (const id of ids) {
    const a = await getAgentStore().getAgent(id);
    if (a) out.push(a);
  }
  return out;
}

export { bootstrapWebAgents } from "./bootstrap";
