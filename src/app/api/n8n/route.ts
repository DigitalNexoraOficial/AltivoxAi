/**
 * AltivoxAI ↔ n8n bridge
 *
 * Env (Vercel):
 *   N8N_WEBHOOK_URL   – Production Webhook URL from n8n (required for emit)
 *   N8N_WEBHOOK_TEST  – Optional test URL
 *   N8N_SECRET        – Shared secret for inbound calls (header x-altivox-secret)
 *   SUPABASE_URL      – Optional; defaults to project URL
 *   SUPABASE_SERVICE_ROLE_KEY – Required for inbound write actions
 */

import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  can,
  clientIpFromHeaders,
  n8nIntegrationSubject,
  rateLimit,
  resolveOpsUserFromToken,
  writeAuditEvent,
  type Subject,
} from "@/core/security";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://soeyfivsuwohuuzgfqar.supabase.co";

const ALLOWED_ORIGINS = [
  "https://www.altivoxai.es",
  "https://altivoxai.es",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const LEAD_PATCH_FIELDS = [
  "estado",
  "score",
  "prioridad",
  "notas",
  "nombre",
  "email",
  "telefono",
  "empresa",
  "origen",
  "contacto_at",
  "updated_at",
] as const;

const CLIENTE_FIELDS = [
  "nombre",
  "email",
  "telefono",
  "empresa",
  "estado",
  "notas",
  "origen",
  "plan",
  "updated_at",
  "created_at",
] as const;

type ApiError = Error & { code?: string; status?: number };

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  return /^https:\/\/([a-z0-9-]+\.)*altivoxai\.vercel\.app$/i.test(origin);
}

function pickOrigin(req: NextRequest): string {
  const origin = String(req.headers.get("origin") || "");
  if (isAllowedOrigin(origin)) return origin;
  return ALLOWED_ORIGINS[0];
}

function withCors(req: NextRequest, res: NextResponse): NextResponse {
  res.headers.set("Access-Control-Allow-Origin", pickOrigin(req));
  res.headers.set("Vary", "Origin");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, x-altivox-secret, Authorization"
  );
  return res;
}

function clientIp(req: NextRequest): string {
  return clientIpFromHeaders(req.headers);
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(String(a || ""), "utf8");
  const right = Buffer.from(String(b || ""), "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function okSecret(req: NextRequest): boolean {
  const expected = process.env.N8N_SECRET;
  if (!expected) return false;
  const got = req.headers.get("x-altivox-secret") || "";
  if (!got) return false;
  return safeEqual(got, expected);
}

async function resolveSubject(req: NextRequest): Promise<Subject | null> {
  if (okSecret(req)) return n8nIntegrationSubject();
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const user = await resolveOpsUserFromToken(token);
  return user?.subject || null;
}

async function authorize(
  req: NextRequest,
  action: "n8n.emit" | "n8n.write_crm",
  resourceType?: string,
  resourceId?: string
): Promise<{ ok: true; subject: Subject } | { ok: false; res: NextResponse }> {
  const ip = clientIp(req);
  const subject = await resolveSubject(req);
  const decision = can(subject, action, {
    type: resourceType || "n8n",
    id: resourceId,
  });
  if (!subject || !decision.allowed) {
    await writeAuditEvent({
      actorType:
        subject?.type === "machine"
          ? "machine"
          : subject
            ? "human"
            : "anonymous",
      actorId: subject?.id,
      actorRole:
        subject?.type === "human"
          ? subject.role
          : subject?.type === "machine"
            ? subject.principalType
            : undefined,
      action: "n8n." + action,
      permission: action,
      resourceType,
      resourceId,
      result: "deny",
      ip,
      errorCode: decision.reason,
    });
    return {
      ok: false,
      res: withCors(
        req,
        NextResponse.json({ error: "No autorizado" }, { status: 401 })
      ),
    };
  }
  return { ok: true, subject };
}

function pickAllowedFields(
  input: unknown,
  allowlist: readonly string[]
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) return out;
  const obj = input as Record<string, unknown>;
  for (const key of allowlist) {
    if (
      Object.prototype.hasOwnProperty.call(obj, key) &&
      obj[key] !== undefined
    ) {
      out[key] = obj[key];
    }
  }
  return out;
}

async function supabaseRest(
  path: string,
  { method = "GET", body }: { method?: string; body?: unknown } = {}
) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    const err: ApiError = new Error("Falta SUPABASE_SERVICE_ROLE_KEY en Vercel");
    err.code = "NO_SERVICE_KEY";
    throw err;
  }
  const res = await fetch(SUPABASE_URL + "/rest/v1/" + path, {
    method,
    headers: {
      apikey: key,
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const err: ApiError = new Error(
      (data && data.message) || (data && data.error) || text || "Supabase error"
    );
    err.status = res.status;
    throw err;
  }
  return data;
}

async function forwardToN8n(event: string, data: unknown, test?: boolean) {
  const url = test
    ? process.env.N8N_WEBHOOK_TEST || process.env.N8N_WEBHOOK_URL
    : process.env.N8N_WEBHOOK_URL;
  if (!url) {
    const err: ApiError = new Error(
      "Falta N8N_WEBHOOK_URL en Vercel. Crea un Webhook en n8n y pega la URL Production."
    );
    err.code = "NO_WEBHOOK";
    throw err;
  }

  const payload = {
    source: "altivoxai",
    event: event || "unknown",
    ts: new Date().toISOString(),
    data: data || {},
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Altivox-Event": payload.event,
      ...(process.env.N8N_SECRET
        ? { "x-altivox-secret": process.env.N8N_SECRET }
        : {}),
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  return {
    forwarded: true,
    status: res.status,
    ok: res.ok,
  };
}

export async function OPTIONS(req: NextRequest) {
  return withCors(req, new NextResponse(null, { status: 204 }));
}

export async function GET(req: NextRequest) {
  return withCors(
    req,
    NextResponse.json({ ok: true, service: "altivox-n8n" })
  );
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = await rateLimit("n8n", ip);
  if (!rl.success) {
    await writeAuditEvent({
      actorType: "anonymous",
      action: "n8n.request",
      result: "rate_limited",
      ip,
      errorCode: rl.reason,
    });
    return withCors(
      req,
      NextResponse.json({ error: "Demasiadas peticiones" }, { status: 429 })
    );
  }

  try {
    const body: any = await req.json().catch(() => ({}));
    const action = body.action || "emit";

    if (action === "ping" || action === "emit") {
      const event =
        action === "ping" ? "system.ping" : body.event || "unknown";
      const data =
        action === "ping"
          ? { message: "pong", from: String(body.from || "api").slice(0, 80) }
          : body.data || {};

      const authz = await authorize(req, "n8n.emit");
      if (!authz.ok) return authz.res;

      try {
        const result = await forwardToN8n(event, data, Boolean(body.test));
        await writeAuditEvent({
          actorType: authz.subject.type === "machine" ? "machine" : "human",
          actorId: authz.subject.id,
          actorRole:
            authz.subject.type === "human"
              ? authz.subject.role
              : authz.subject.principalType,
          action: "n8n.emit",
          permission: "n8n.emit",
          result: "ok",
          ip,
          metadata: { event },
        });
        return withCors(req, NextResponse.json({ event, ...result }));
      } catch (e: any) {
        if (e.code === "NO_WEBHOOK") {
          return withCors(
            req,
            NextResponse.json(
              { ok: false, error: "Servicio temporalmente no disponible" },
              { status: 503 }
            )
          );
        }
        throw e;
      }
    }

    const authzWrite = await authorize(req, "n8n.write_crm");
    if (!authzWrite.ok) return authzWrite.res;

    if (action === "update_lead") {
      if (!body.id || !body.patch || typeof body.patch !== "object") {
        return withCors(
          req,
          NextResponse.json({ error: "Requiere id y patch" }, { status: 400 })
        );
      }
      const patch = pickAllowedFields(body.patch, LEAD_PATCH_FIELDS);
      if (!Object.keys(patch).length) {
        return withCors(
          req,
          NextResponse.json(
            { error: "Patch sin campos permitidos" },
            { status: 400 }
          )
        );
      }
      const data = await supabaseRest(
        "leads?id=eq." + encodeURIComponent(String(body.id)),
        { method: "PATCH", body: patch }
      );
      await writeAuditEvent({
        actorType: authzWrite.subject.type === "machine" ? "machine" : "human",
        actorId: authzWrite.subject.id,
        actorRole:
          authzWrite.subject.type === "human"
            ? authzWrite.subject.role
            : authzWrite.subject.principalType,
        action: "n8n.update_lead",
        permission: "n8n.write_crm",
        resourceType: "lead",
        resourceId: String(body.id),
        result: "ok",
        ip,
      });
      return withCors(req, NextResponse.json({ ok: true, data }));
    }

    if (action === "create_cliente") {
      if (!body.data || typeof body.data !== "object") {
        return withCors(
          req,
          NextResponse.json({ error: "Requiere data" }, { status: 400 })
        );
      }
      const payload = pickAllowedFields(body.data, CLIENTE_FIELDS);
      if (!Object.keys(payload).length) {
        return withCors(
          req,
          NextResponse.json(
            { error: "Data sin campos permitidos" },
            { status: 400 }
          )
        );
      }
      const data = await supabaseRest("clientes", {
        method: "POST",
        body: payload,
      });
      await writeAuditEvent({
        actorType: authzWrite.subject.type === "machine" ? "machine" : "human",
        actorId: authzWrite.subject.id,
        actorRole:
          authzWrite.subject.type === "human"
            ? authzWrite.subject.role
            : authzWrite.subject.principalType,
        action: "n8n.create_cliente",
        permission: "n8n.write_crm",
        resourceType: "cliente",
        result: "ok",
        ip,
      });
      return withCors(req, NextResponse.json({ ok: true, data }));
    }

    if (action === "update_cliente") {
      if (!body.id || !body.patch || typeof body.patch !== "object") {
        return withCors(
          req,
          NextResponse.json({ error: "Requiere id y patch" }, { status: 400 })
        );
      }
      const patch = pickAllowedFields(body.patch, CLIENTE_FIELDS);
      if (!Object.keys(patch).length) {
        return withCors(
          req,
          NextResponse.json(
            { error: "Patch sin campos permitidos" },
            { status: 400 }
          )
        );
      }
      const data = await supabaseRest(
        "clientes?id=eq." + encodeURIComponent(String(body.id)),
        { method: "PATCH", body: patch }
      );
      await writeAuditEvent({
        actorType: authzWrite.subject.type === "machine" ? "machine" : "human",
        actorId: authzWrite.subject.id,
        actorRole:
          authzWrite.subject.type === "human"
            ? authzWrite.subject.role
            : authzWrite.subject.principalType,
        action: "n8n.update_cliente",
        permission: "n8n.write_crm",
        resourceType: "cliente",
        resourceId: String(body.id),
        result: "ok",
        ip,
      });
      return withCors(req, NextResponse.json({ ok: true, data }));
    }

    return withCors(
      req,
      NextResponse.json(
        {
          error: "Acción desconocida",
          allowed: [
            "emit",
            "ping",
            "update_lead",
            "create_cliente",
            "update_cliente",
          ],
        },
        { status: 400 }
      )
    );
  } catch (e: any) {
    console.error("n8n bridge error", e?.code || e?.message);
    return withCors(
      req,
      NextResponse.json(
        {
          error: "Error interno",
        },
        { status: 500 }
      )
    );
  }
}
