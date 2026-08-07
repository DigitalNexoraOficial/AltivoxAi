/**
 * Bootstrap helpers — register web module agents (Bloque 5).
 */

import type { AgentRecord } from "@/core/agent-runtime/types";
import { type Subject } from "@/core/security";
import { registerAgent } from "@/core/agent-manager";
import { webAgentManifests } from "@/modules/web";

/** Requires agent.configure (admin+). */
export async function bootstrapWebAgents(
  subject: Subject
): Promise<AgentRecord[]> {
  const out: AgentRecord[] = [];
  for (const m of webAgentManifests) {
    out.push(await registerAgent(subject, m));
  }
  return out;
}
