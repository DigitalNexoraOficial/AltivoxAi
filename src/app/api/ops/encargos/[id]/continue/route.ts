/**
 * POST /api/ops/encargos/[id]/continue
 */
import { NextRequest, NextResponse } from "next/server";
import { continueEncargo } from "@/core/encargo";
import {
  requireOpsUser,
  handleEncargoError,
  auditOk,
} from "../../_shared";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const gate = await requireOpsUser(req, "encargo.continue");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;
  const { id } = await ctx.params;
  try {
    const view = await continueEncargo(user.subject, id);
    await auditOk(user, ip, "encargo.continue", "agent.execute", id);
    return NextResponse.json(view);
  } catch (err) {
    return handleEncargoError(err, {
      user,
      ip,
      action: "encargo.continue",
      permission: "agent.execute",
      resourceId: id,
    });
  }
}
