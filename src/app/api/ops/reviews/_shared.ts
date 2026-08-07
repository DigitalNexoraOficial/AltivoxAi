/**
 * Shared helpers for /api/ops/reviews*
 */

import { NextRequest, NextResponse } from "next/server";
import {
  clientIpFromHeaders,
  rateLimit,
  resolveOpsUserFromToken,
  writeAuditEvent,
  OPS_COOKIE,
  type ResolvedOpsUser,
} from "@/core/security";
import { ReviewError } from "@/core/review-engine";

export function readToken(req: NextRequest): string {
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.replace(/^Bearer\s+/i, "").trim();
  if (bearer) return bearer;
  return req.cookies.get(OPS_COOKIE)?.value || "";
}

export async function requireOpsUser(
  req: NextRequest,
  auditAction: string
): Promise<
  | { ok: true; user: ResolvedOpsUser; ip: string }
  | { ok: false; response: NextResponse }
> {
  const ip = clientIpFromHeaders(req.headers);
  const rl = await rateLimit("ops", ip);
  if (!rl.success) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Demasiadas peticiones" },
        { status: 429 }
      ),
    };
  }

  const token = readToken(req);
  const user = await resolveOpsUserFromToken(token);
  if (!user) {
    await writeAuditEvent({
      actorType: "anonymous",
      action: auditAction,
      resourceType: "review",
      result: "deny",
      ip,
      errorCode: "unauthorized",
    });
    return {
      ok: false,
      response: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, user, ip };
}

/** Duck-type ReviewError — Next bundling can break `instanceof` across chunks. */
function asReviewError(
  err: unknown
): { code: string; message: string; status: number } | null {
  if (err instanceof ReviewError) {
    return { code: err.code, message: err.message, status: err.status };
  }
  if (
    err &&
    typeof err === "object" &&
    (err as { name?: string }).name === "ReviewError" &&
    typeof (err as { code?: unknown }).code === "string" &&
    typeof (err as { message?: unknown }).message === "string"
  ) {
    const status =
      typeof (err as { status?: unknown }).status === "number"
        ? (err as { status: number }).status
        : 500;
    return {
      code: (err as { code: string }).code,
      message: (err as { message: string }).message,
      status,
    };
  }
  return null;
}

export async function handleReviewError(
  err: unknown,
  ctx: {
    user?: ResolvedOpsUser;
    ip: string;
    action: string;
    permission?: string;
    resourceId?: string;
  }
): Promise<NextResponse> {
  const reviewErr = asReviewError(err);
  if (reviewErr) {
    const result =
      reviewErr.code === "forbidden"
        ? "deny"
        : reviewErr.code === "persistence_error"
          ? "error"
          : "rejected";
    await writeAuditEvent({
      actorType: ctx.user ? "human" : "anonymous",
      actorId: ctx.user?.id,
      actorRole: ctx.user?.role,
      action: ctx.action,
      permission: ctx.permission,
      resourceType: "review",
      resourceId: ctx.resourceId,
      result,
      ip: ctx.ip,
      errorCode: reviewErr.code,
      metadata: { message: reviewErr.message },
    });
    return NextResponse.json(
      { error: reviewErr.code, message: reviewErr.message },
      { status: reviewErr.status }
    );
  }

  const message =
    err instanceof Error
      ? String(err.message || err.name || "unknown").slice(0, 240)
      : "unknown";

  await writeAuditEvent({
    actorType: ctx.user ? "human" : "system",
    actorId: ctx.user?.id,
    actorRole: ctx.user?.role,
    action: ctx.action,
    permission: ctx.permission,
    resourceType: "review",
    resourceId: ctx.resourceId,
    result: "error",
    ip: ctx.ip,
    errorCode: "unhandled",
    metadata: { message },
  });
  return NextResponse.json(
    { error: "internal_error", message },
    { status: 500 }
  );
}

export async function auditOk(
  user: ResolvedOpsUser,
  ip: string,
  action: string,
  permission: string,
  resourceId?: string
): Promise<void> {
  await writeAuditEvent({
    actorType: "human",
    actorId: user.id,
    actorRole: user.role,
    action,
    permission,
    resourceType: "review",
    resourceId,
    result: "ok",
    ip,
  });
}

export async function readJson(
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
