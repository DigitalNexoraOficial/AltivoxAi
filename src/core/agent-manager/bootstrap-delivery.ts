/**
 * Bootstrap delivery (encargo) agents — requires agent.configure.
 */

import type { AgentRecord } from "@/core/agent-runtime/types";
import { type Subject } from "@/core/security";
import { registerAgent } from "@/core/agent-manager";
import { deliveryAgentManifests } from "@/modules/delivery";

export async function bootstrapDeliveryAgents(
  subject: Subject
): Promise<AgentRecord[]> {
  const out: AgentRecord[] = [];
  for (const m of deliveryAgentManifests) {
    out.push(await registerAgent(subject, m));
  }
  return out;
}
