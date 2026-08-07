/**
 * GET /api/ops/agent-runs/[id]
 * POST /api/ops/agent-runs/[id] — execute (body optional { action: "execute" })
 */
import { NextRequest, NextResponse } from "next/server";
import { executeAgentRun, getAgentRun } from "@/core/agent-runtime";
import {
  requireOpsUser,
  handleAgentError,
  auditOk,
  readJson,
} from "../../_agent-shared";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const gate = await requireOpsUser(req, "agent.run.get");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;
  const { id } = await ctx.params;
  try {
    const run = await getAgentRun(user.subject, id);
    await auditOk(user, ip, "agent.run.get", "agent.execute", id);
    return NextResponse.json({ run });
  } catch (err) {
    return handleAgentError(err, {
      user,
      ip,
      action: "agent.run.get",
      permission: "agent.execute",
      resourceId: id,
    });
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const gate = await requireOpsUser(req, "agent.run.execute");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;
  const { id } = await ctx.params;
  try {
    let action = "execute";
    try {
      const body = await readJson(req);
      if (typeof body.action === "string") action = body.action;
    } catch {
      /* empty body ok */
    }
    if (action !== "execute") {
      return NextResponse.json(
        { error: "invalid_input", message: "action_must_be_execute" },
        { status: 400 }
      );
    }
    const run = await executeAgentRun(user.subject, id);
    await auditOk(user, ip, "agent.run.execute", "agent.execute", id);
    return NextResponse.json({ run });
  } catch (err) {
    return handleAgentError(err, {
      user,
      ip,
      action: "agent.run.execute",
      permission: "agent.execute",
      resourceId: id,
    });
  }
}
