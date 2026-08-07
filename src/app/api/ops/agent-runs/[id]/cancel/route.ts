/**
 * POST /api/ops/agent-runs/[id]/cancel
 */
import { NextRequest, NextResponse } from "next/server";
import { cancelAgentRun } from "@/core/agent-runtime";
import {
  requireOpsUser,
  handleAgentError,
  auditOk,
} from "../../../_agent-shared";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const gate = await requireOpsUser(req, "agent.run.cancel");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;
  const { id } = await ctx.params;
  try {
    const run = await cancelAgentRun(user.subject, id);
    await auditOk(user, ip, "agent.run.cancel", "agent.stop", id);
    return NextResponse.json({ run });
  } catch (err) {
    return handleAgentError(err, {
      user,
      ip,
      action: "agent.run.cancel",
      permission: "agent.stop",
      resourceId: id,
    });
  }
}
