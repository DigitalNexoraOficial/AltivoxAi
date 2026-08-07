/**
 * GET  /api/ops/reviews/[id]
 * POST /api/ops/reviews/[id] — revoke
 */
import { NextRequest, NextResponse } from "next/server";
import { getReviewForOps, revokeReview } from "@/core/review-engine";
import {
  requireOpsUser,
  handleReviewError,
  auditOk,
} from "../_shared";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const gate = await requireOpsUser(req, "review.get");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;
  const { id } = await ctx.params;
  try {
    const view = await getReviewForOps(user.subject, id);
    await auditOk(user, ip, "review.get", "project.read", id);
    return NextResponse.json(view);
  } catch (err) {
    return handleReviewError(err, {
      user,
      ip,
      action: "review.get",
      permission: "project.read",
      resourceId: id,
    });
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const gate = await requireOpsUser(req, "review.revoke");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;
  const { id } = await ctx.params;
  try {
    const view = await revokeReview(user.subject, id);
    await auditOk(user, ip, "review.revoke", "review.revoke", id);
    return NextResponse.json(view);
  } catch (err) {
    return handleReviewError(err, {
      user,
      ip,
      action: "review.revoke",
      permission: "review.revoke",
      resourceId: id,
    });
  }
}
