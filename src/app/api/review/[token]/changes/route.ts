/**
 * POST /api/review/[token]/changes — request changes
 */
import { NextRequest, NextResponse } from "next/server";
import { requestChangesOnReview } from "@/core/review-engine";
import { handleClientReviewError, withReviewRateLimit } from "../../_shared";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ token: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const gate = await withReviewRateLimit(req);
  if (!gate.ok) return gate.response;
  const { token } = await ctx.params;
  try {
    const view = await requestChangesOnReview(token);
    return NextResponse.json({ review: view });
  } catch (err) {
    return handleClientReviewError(err, gate.ip, "review.client.changes");
  }
}
