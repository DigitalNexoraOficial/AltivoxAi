/**
 * POST /api/review/[token]/comments
 */
import { NextRequest, NextResponse } from "next/server";
import { commentOnReview } from "@/core/review-engine";
import {
  handleClientReviewError,
  readJsonBody,
  withReviewRateLimit,
} from "../../_shared";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ token: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const gate = await withReviewRateLimit(req);
  if (!gate.ok) return gate.response;
  const { token } = await ctx.params;
  try {
    const body = await readJsonBody(req);
    const view = await commentOnReview(token, String(body.body || ""));
    return NextResponse.json({ review: view });
  } catch (err) {
    return handleClientReviewError(err, gate.ip, "review.client.comment");
  }
}
