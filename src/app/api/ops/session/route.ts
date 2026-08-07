import { NextRequest, NextResponse } from "next/server";
import {
  permissionsForHumanRole,
} from "@/core/security/roles";
import { writeAuditEvent } from "@/core/security/audit";
import {
  rateLimit,
  clientIpFromHeaders,
} from "@/core/security/rate-limit";
import {
  clearOpsCookie,
  resolveOpsUserFromToken,
  setOpsCookie,
} from "@/core/security/session";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);
  const rl = await rateLimit("ops", ip);
  if (!rl.success) {
    return NextResponse.json({ error: "Demasiadas peticiones" }, { status: 429 });
  }

  const auth = req.headers.get("authorization") || "";
  const bearer = auth.replace(/^Bearer\s+/i, "").trim();
  const cookie = req.cookies.get("altivox_ops_token")?.value || "";
  const token = bearer || cookie;

  const user = await resolveOpsUserFromToken(token);
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: Array.from(permissionsForHumanRole(user.role)),
    },
  });
}

/** Exchange Bearer (from Supabase JS localStorage session) → httpOnly cookie for middleware */
export async function POST(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);
  const rl = await rateLimit("login", ip);
  if (!rl.success) {
    await writeAuditEvent({
      actorType: "anonymous",
      action: "ops.session.sync",
      result: "rate_limited",
      ip,
    });
    return NextResponse.json({ error: "Demasiadas peticiones" }, { status: 429 });
  }

  const auth = req.headers.get("authorization") || "";
  const bearer = auth.replace(/^Bearer\s+/i, "").trim();
  if (!bearer) {
    return NextResponse.json({ error: "Falta Bearer token" }, { status: 400 });
  }

  const user = await resolveOpsUserFromToken(bearer);
  if (!user) {
    await writeAuditEvent({
      actorType: "anonymous",
      action: "ops.session.sync",
      result: "deny",
      ip,
      errorCode: "forbidden_or_no_role",
    });
    const res = NextResponse.json(
      {
        ok: false,
        error: "forbidden",
        message:
          "Sesión válida pero sin rol staff. Asigna app_metadata.role en Supabase.",
      },
      { status: 403 }
    );
    clearOpsCookie(res);
    return res;
  }

  await writeAuditEvent({
    actorType: "human",
    actorId: user.id,
    actorRole: user.role,
    action: "ops.session.sync",
    permission: "ops.access",
    result: "ok",
    ip,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  const res = NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: Array.from(permissionsForHumanRole(user.role)),
    },
  });
  setOpsCookie(res, bearer);
  return res;
}

export async function DELETE(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);
  await writeAuditEvent({
    actorType: "human",
    action: "ops.session.clear",
    result: "ok",
    ip,
  });
  const res = NextResponse.json({ ok: true });
  clearOpsCookie(res);
  return res;
}
