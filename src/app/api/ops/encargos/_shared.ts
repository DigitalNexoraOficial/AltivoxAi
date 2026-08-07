/**
 * Shared encargo API helpers
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
import { EncargoError } from "@/core/encargo";

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
      resourceType: "encargo",
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

function asEncargoError(
  err: unknown
): { code: string; message: string; status: number } | null {
  if (err instanceof EncargoError) {
    return { code: err.code, message: err.message, status: err.status };
  }
  if (
    err &&
    typeof err === "object" &&
    (err as { name?: string }).name === "EncargoError" &&
    typeof (err as { code?: unknown }).code === "string"
  ) {
    return {
      code: (err as { code: string }).code,
      message: String((err as { message?: string }).message || "error"),
      status:
        typeof (err as { status?: number }).status === "number"
          ? (err as { status: number }).status
          : 500,
    };
  }
  return null;
}

export async function handleEncargoError(
  err: unknown,
  ctx: {
    user?: ResolvedOpsUser;
    ip: string;
    action: string;
    permission?: string;
    resourceId?: string;
  }
): Promise<NextResponse> {
  const e = asEncargoError(err);
  if (e) {
    await writeAuditEvent({
      actorType: ctx.user ? "human" : "anonymous",
      actorId: ctx.user?.id,
      actorRole: ctx.user?.role,
      action: ctx.action,
      permission: ctx.permission,
      resourceType: "encargo",
      resourceId: ctx.resourceId,
      result: e.code === "forbidden" ? "deny" : "rejected",
      ip: ctx.ip,
      errorCode: e.code,
      metadata: { message: e.message },
    });
    return NextResponse.json(
      { error: e.code, message: e.message },
      { status: e.status }
    );
  }

  // Surface nested AgentError / ProjectEngineError codes when present
  if (
    err &&
    typeof err === "object" &&
    typeof (err as { code?: unknown }).code === "string" &&
    typeof (err as { message?: unknown }).message === "string"
  ) {
    const code = (err as { code: string }).code;
    const message = (err as { message: string }).message;
    const status =
      typeof (err as { status?: number }).status === "number"
        ? (err as { status: number }).status
        : 500;
    await writeAuditEvent({
      actorType: ctx.user ? "human" : "system",
      actorId: ctx.user?.id,
      action: ctx.action,
      result: "error",
      ip: ctx.ip,
      errorCode: code,
      metadata: { message },
    });
    return NextResponse.json({ error: code, message }, { status });
  }

  const message =
    err instanceof Error
      ? String(err.message || err.name).slice(0, 240)
      : "unknown";
  await writeAuditEvent({
    actorType: ctx.user ? "human" : "system",
    actorId: ctx.user?.id,
    action: ctx.action,
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
    resourceType: "encargo",
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
      throw new EncargoError("invalid_input", "invalid_json_body");
    }
    return body as Record<string, unknown>;
  } catch (e) {
    if (e instanceof EncargoError) throw e;
    throw new EncargoError("invalid_input", "invalid_json");
  }
}
