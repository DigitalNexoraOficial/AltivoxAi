/**
 * GET /api/ops/encargos/[id]
 */
import { NextRequest, NextResponse } from "next/server";
import { getEncargoView } from "@/core/encargo";
import {
  requireOpsUser,
  handleEncargoError,
  auditOk,
} from "../_shared";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const gate = await requireOpsUser(req, "encargo.get");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;
  const { id } = await ctx.params;
  try {
    const view = await getEncargoView(user.subject, id);
    await auditOk(user, ip, "encargo.get", "project.read", id);
    return NextResponse.json(view);
  } catch (err) {
    return handleEncargoError(err, {
      user,
      ip,
      action: "encargo.get",
      permission: "project.read",
      resourceId: id,
    });
  }
}
