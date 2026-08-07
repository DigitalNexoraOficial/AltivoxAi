/**
 * POST /api/ops/encargos/[id]/steps/[stepId]/approve
 */
import { NextRequest, NextResponse } from "next/server";
import { approveStep } from "@/core/encargo";
import {
  requireOpsUser,
  handleEncargoError,
  auditOk,
} from "../../../../_shared";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string; stepId: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const gate = await requireOpsUser(req, "encargo.step.approve");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;
  const { id, stepId } = await ctx.params;
  try {
    const view = await approveStep(user.subject, id, stepId);
    await auditOk(user, ip, "encargo.step.approve", "agent.execute", stepId);
    return NextResponse.json(view);
  } catch (err) {
    return handleEncargoError(err, {
      user,
      ip,
      action: "encargo.step.approve",
      permission: "agent.execute",
      resourceId: stepId,
    });
  }
}
