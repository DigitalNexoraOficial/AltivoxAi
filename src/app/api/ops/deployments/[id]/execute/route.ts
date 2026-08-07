/**
 * POST /api/ops/deployments/[id]/execute
 */
import { NextRequest, NextResponse } from "next/server";
import { executeDeployment } from "@/core/deploy-engine";
import {
  requireOpsUser,
  handleDeployError,
  auditOk,
} from "../../_shared";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const gate = await requireOpsUser(req, "deployment.execute");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;
  const { id } = await ctx.params;
  try {
    const view = await executeDeployment(user.subject, id);
    await auditOk(user, ip, "deployment.execute", "deploy.execute", id);
    return NextResponse.json(view);
  } catch (err) {
    return handleDeployError(err, {
      user,
      ip,
      action: "deployment.execute",
      permission: "deploy.execute",
      resourceId: id,
    });
  }
}
