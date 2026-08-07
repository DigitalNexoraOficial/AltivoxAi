/**
 * GET /api/ops/deployments/[id]
 */
import { NextRequest, NextResponse } from "next/server";
import { getDeployment } from "@/core/deploy-engine";
import {
  requireOpsUser,
  handleDeployError,
  auditOk,
} from "../_shared";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const gate = await requireOpsUser(req, "deployment.get");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;
  const { id } = await ctx.params;
  try {
    const view = await getDeployment(user.subject, id);
    await auditOk(user, ip, "deployment.get", "project.read", id);
    return NextResponse.json(view);
  } catch (err) {
    return handleDeployError(err, {
      user,
      ip,
      action: "deployment.get",
      permission: "project.read",
      resourceId: id,
    });
  }
}
