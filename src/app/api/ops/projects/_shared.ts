/**
 * Shared helpers for /api/ops/projects* Route Handlers.
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
import { ProjectEngineError } from "@/core/project-engine";

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
      resourceType: "project",
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

export async function handleEngineError(
  err: unknown,
  ctx: {
    user?: ResolvedOpsUser;
    ip: string;
    action: string;
    permission?: string;
    projectId?: string;
  }
): Promise<NextResponse> {
  if (err instanceof ProjectEngineError) {
    const result =
      err.code === "forbidden"
        ? "deny"
        : err.code === "persistence_error"
          ? "error"
          : "rejected";
    await writeAuditEvent({
      actorType: ctx.user ? "human" : "anonymous",
      actorId: ctx.user?.id,
      actorRole: ctx.user?.role,
      action: ctx.action,
      permission: ctx.permission,
      resourceType: "project",
      resourceId: ctx.projectId,
      result,
      ip: ctx.ip,
      errorCode: err.code,
      metadata: { message: err.message },
    });
    return NextResponse.json(
      { error: err.code, message: err.message },
      { status: err.status }
    );
  }

  await writeAuditEvent({
    actorType: ctx.user ? "human" : "system",
    actorId: ctx.user?.id,
    actorRole: ctx.user?.role,
    action: ctx.action,
    permission: ctx.permission,
    resourceType: "project",
    resourceId: ctx.projectId,
    result: "error",
    ip: ctx.ip,
    errorCode: "unhandled",
  });
  return NextResponse.json({ error: "internal_error" }, { status: 500 });
}

export async function auditOk(
  user: ResolvedOpsUser,
  ip: string,
  action: string,
  permission: string,
  projectId?: string
): Promise<void> {
  await writeAuditEvent({
    actorType: "human",
    actorId: user.id,
    actorRole: user.role,
    action,
    permission,
    resourceType: "project",
    resourceId: projectId,
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
      throw new ProjectEngineError("invalid_input", "invalid_json_body");
    }
    return body as Record<string, unknown>;
  } catch (e) {
    if (e instanceof ProjectEngineError) throw e;
    throw new ProjectEngineError("invalid_input", "invalid_json");
  }
}
