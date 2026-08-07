/**
 * Client Review API helpers — token auth only (no Ops cookie).
 */

import { NextRequest, NextResponse } from "next/server";
import {
  clientIpFromHeaders,
  rateLimit,
  writeAuditEvent,
} from "@/core/security";
import { ReviewError } from "@/core/review-engine";

export async function withReviewRateLimit(
  req: NextRequest
): Promise<{ ok: true; ip: string } | { ok: false; response: NextResponse }> {
  const ip = clientIpFromHeaders(req.headers);
  const rl = await rateLimit("review", ip);
  if (!rl.success) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Demasiadas peticiones" },
        { status: 429 }
      ),
    };
  }
  return { ok: true, ip };
}

export async function handleClientReviewError(
  err: unknown,
  ip: string,
  action: string
): Promise<NextResponse> {
  if (err instanceof ReviewError) {
    await writeAuditEvent({
      actorType: "anonymous",
      action,
      resourceType: "review",
      result: err.code === "forbidden" ? "deny" : "rejected",
      ip,
      errorCode: err.code,
      // Never log the token or secrets
      metadata: { message: err.message },
    });
    return NextResponse.json(
      { error: err.code, message: err.message },
      { status: err.status }
    );
  }
  await writeAuditEvent({
    actorType: "system",
    action,
    resourceType: "review",
    result: "error",
    ip,
    errorCode: "unhandled",
  });
  return NextResponse.json({ error: "internal_error" }, { status: 500 });
}

export async function readJsonBody(
  req: NextRequest
): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new ReviewError("invalid_input", "invalid_json_body");
    }
    return body as Record<string, unknown>;
  } catch (e) {
    if (e instanceof ReviewError) throw e;
    throw new ReviewError("invalid_input", "invalid_json");
  }
}
