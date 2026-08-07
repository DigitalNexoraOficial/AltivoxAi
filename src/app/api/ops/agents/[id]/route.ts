/**
 * GET /api/ops/agents/[id]
 */
import { NextRequest, NextResponse } from "next/server";
import { getAgent } from "@/core/agent-manager";
import {
  requireOpsUser,
  handleAgentError,
  auditOk,
} from "../../_agent-shared";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const gate = await requireOpsUser(req, "agent.get");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;
  const { id } = await ctx.params;
  try {
    const agent = await getAgent(user.subject, id);
    await auditOk(user, ip, "agent.get", "agent.execute", id);
    return NextResponse.json({ agent });
  } catch (err) {
    return handleAgentError(err, {
      user,
      ip,
      action: "agent.get",
      permission: "agent.execute",
      resourceId: id,
    });
  }
}
