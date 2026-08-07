/**
 * Site settings write path for Ops.
 * Auth: Supabase access token (Bearer or ops cookie transport).
 * Authz: can(subject, "settings.write", resource).
 * Persistence: user's JWT + anon key (RLS enforced) — never service_role.
 */
import { NextRequest, NextResponse } from "next/server";
import {
  can,
  clientIpFromHeaders,
  rateLimit,
  resolveOpsUserFromToken,
  writeAuditEvent,
  OPS_COOKIE,
} from "@/core/security";

export const runtime = "nodejs";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://soeyfivsuwohuuzgfqar.supabase.co";

const KEYS = ["brand", "hero", "contact", "flags", "social"] as const;

function readToken(req: NextRequest): string {
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.replace(/^Bearer\s+/i, "").trim();
  if (bearer) return bearer;
  return req.cookies.get(OPS_COOKIE)?.value || "";
}

export async function POST(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);
  const rl = await rateLimit("ops", ip);
  if (!rl.success) {
    return NextResponse.json({ error: "Demasiadas peticiones" }, { status: 429 });
  }

  const token = readToken(req);
  const user = await resolveOpsUserFromToken(token);
  if (!user) {
    await writeAuditEvent({
      actorType: "anonymous",
      action: "settings.write",
      permission: "settings.write",
      resourceType: "site_settings",
      result: "deny",
      ip,
      errorCode: "unauthorized",
    });
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const decision = can(user.subject, "settings.write", {
    type: "site_settings",
  });
  if (!decision.allowed) {
    await writeAuditEvent({
      actorType: "human",
      actorId: user.id,
      actorRole: user.role,
      action: "settings.write",
      permission: "settings.write",
      resourceType: "site_settings",
      result: "deny",
      ip,
      errorCode: decision.reason,
    });
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const anon = String(process.env.SUPABASE_ANON_KEY || "").trim();
  if (!anon) {
    return NextResponse.json({ error: "missing_anon_key" }, { status: 500 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const rows = KEYS.map((key) => ({
    key,
    value: (body[key] && typeof body[key] === "object"
      ? body[key]
      : {}) as Record<string, unknown>,
    updated_at: new Date().toISOString(),
    updated_by: user.email || user.id,
  }));

  const res = await fetch(
    SUPABASE_URL + "/rest/v1/site_settings?on_conflict=key",
    {
      method: "POST",
      headers: {
        apikey: anon,
        Authorization: "Bearer " + user.accessToken,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(rows),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    await writeAuditEvent({
      actorType: "human",
      actorId: user.id,
      actorRole: user.role,
      action: "settings.write",
      permission: "settings.write",
      resourceType: "site_settings",
      result: "error",
      ip,
      errorCode: "supabase_" + res.status,
      metadata: { detail: text.slice(0, 200) },
    });
    return NextResponse.json({ error: "write_failed" }, { status: 502 });
  }

  await writeAuditEvent({
    actorType: "human",
    actorId: user.id,
    actorRole: user.role,
    action: "settings.write",
    permission: "settings.write",
    resourceType: "site_settings",
    result: "ok",
    ip,
  });

  return NextResponse.json({ ok: true });
}
