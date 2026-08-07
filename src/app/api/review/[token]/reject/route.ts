/**
 * POST /api/review/[token]/reject
 */
import { NextRequest, NextResponse } from "next/server";
import { rejectReview } from "@/core/review-engine";
import { handleClientReviewError, withReviewRateLimit } from "../../_shared";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ token: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const gate = await withReviewRateLimit(req);
  if (!gate.ok) return gate.response;
  const { token } = await ctx.params;
  try {
    const view = await rejectReview(token);
    return NextResponse.json({ review: view });
  } catch (err) {
    return handleClientReviewError(err, gate.ip, "review.client.reject");
  }
}
