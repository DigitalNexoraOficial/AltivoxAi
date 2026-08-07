/**
 * POST /api/ops/deployments/[id]/cancel
 */
import { NextRequest, NextResponse } from "next/server";
import { cancelDeployment } from "@/core/deploy-engine";
import {
  requireOpsUser,
  handleDeployError,
  auditOk,
} from "../../_shared";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const gate = await requireOpsUser(req, "deployment.cancel");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;
  const { id } = await ctx.params;
  try {
    const view = await cancelDeployment(user.subject, id);
    await auditOk(user, ip, "deployment.cancel", "deploy.cancel", id);
    return NextResponse.json(view);
  } catch (err) {
    return handleDeployError(err, {
      user,
      ip,
      action: "deployment.cancel",
      permission: "deploy.cancel",
      resourceId: id,
    });
  }
}
