/**
 * GET /api/ops/projects/[id]/timeline
 */
import { NextRequest, NextResponse } from "next/server";
import { listTimeline, actionForOp } from "@/core/project-engine";
import {
  requireOpsUser,
  handleEngineError,
  auditOk,
} from "../../_shared";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const gate = await requireOpsUser(req, "project.timeline");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;

  try {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") || "100");
    const events = await listTimeline(
      user.subject,
      id,
      Number.isFinite(limit) ? limit : 100
    );
    await auditOk(user, ip, "project.timeline", actionForOp("read"), id);
    return NextResponse.json({ events });
  } catch (err) {
    return handleEngineError(err, {
      user,
      ip,
      action: "project.timeline",
      permission: actionForOp("read"),
      projectId: id,
    });
  }
}
