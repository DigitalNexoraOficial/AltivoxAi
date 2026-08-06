/**
 * Public lead capture for website forms (guía, calculadora, etc.)
 *
 * Env (Vercel):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  – preferred (bypasses RLS)
 *   SUPABASE_ANON_KEY          – fallback if service role missing + RLS allows anon insert
 *   N8N_WEBHOOK_URL            – forward lead.created / lead.hot
 */

import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://soeyfivsuwohuuzgfqar.supabase.co";

const ALLOWED_ORIGINS = [
  "https://www.altivoxai.es",
  "https://altivoxai.es",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const LEAD_FIELDS = [
  "nombre",
  "email",
  "empresa",
  "telefono",
  "mensaje",
  "tipo_interes",
  "fuente",
  "score",
  "clasificacion",
  "prioridad",
  "estado",
  "auto_respuesta",
  "ultimo_contacto",
] as const;

const rateBucket = new Map<string, { count: number; start: number }>();

type ApiError = Error & {
  code?: string;
  status?: number;
  details?: unknown;
};

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  return /^https:\/\/([a-z0-9-]+\.)*altivoxai\.vercel\.app$/i.test(origin);
}

function pickOrigin(req: NextRequest): string {
  const origin = String(req.headers.get("origin") || "");
  if (isAllowedOrigin(origin)) return origin;
  return ALLOWED_ORIGINS[0];
}

function corsHeaders(req: NextRequest): HeadersInit {
  return {
    "Access-Control-Allow-Origin": pickOrigin(req),
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function withCors(req: NextRequest, res: NextResponse): NextResponse {
  const headers = corsHeaders(req);
  for (const [key, value] of Object.entries(headers)) {
    res.headers.set(key, value);
  }
  return res;
}

function clientIp(req: NextRequest): string {
  const xf = String(req.headers.get("x-forwarded-for") || "")
    .split(",")[0]
    .trim();
  return xf || "unknown";
}

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxHits = 20;
  const entry = rateBucket.get(ip) || { count: 0, start: now };
  if (now - entry.start > windowMs) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  rateBucket.set(ip, entry);
  return entry.count <= maxHits;
}

function pickAllowedFields(input: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) return out;
  const obj = input as Record<string, unknown>;
  for (const key of LEAD_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) {
      out[key] = obj[key];
    }
  }
  return out;
}

function normalizeEmail(email: unknown): string {
  return String(email || "")
    .trim()
    .toLowerCase()
    .slice(0, 200);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function supabaseKey(): string {
  const service = String(
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      ""
  ).trim();
  if (service) return service;
  return String(process.env.SUPABASE_ANON_KEY || "").trim();
}

async function insertLead(payload: Record<string, unknown>) {
  const key = supabaseKey();
  if (!key) {
    const err: ApiError = new Error("Configuración de servidor incompleta");
    err.code = "NO_KEY";
    throw err;
  }

  const res = await fetch(SUPABASE_URL + "/rest/v1/leads", {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const err: ApiError = new Error("No se pudo guardar el lead");
    err.status = res.status;
    err.code = "SUPABASE";
    err.details = data;
    throw err;
  }

  return true;
}

async function forwardToN8n(event: string, data: unknown) {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) return { forwarded: false };

  const payload = {
    source: "altivoxai",
    event: event || "lead.created",
    ts: new Date().toISOString(),
    data: data || {},
  };

  try {
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
    return { forwarded: true, ok: res.ok };
  } catch {
    return { forwarded: false };
  }
}

export async function OPTIONS(req: NextRequest) {
  return withCors(req, new NextResponse(null, { status: 204 }));
}

export async function GET(req: NextRequest) {
  return withCors(
    req,
    NextResponse.json({ ok: true, service: "altivox-lead" }, { status: 200 })
  );
}

export async function POST(req: NextRequest) {
  if (!rateLimit(clientIp(req))) {
    return withCors(
      req,
      NextResponse.json(
        { error: "Demasiadas peticiones. Espera un minuto." },
        { status: 429 }
      )
    );
  }

  try {
    const body: Record<string, unknown> = await req.json().catch(() => ({}));
    const email = normalizeEmail(body.email);
    if (!isValidEmail(email)) {
      return withCors(
        req,
        NextResponse.json({ error: "Email inválido" }, { status: 400 })
      );
    }

    const picked = pickAllowedFields(body);
    const score = Math.max(0, Math.min(100, Number(picked.score ?? 55) || 55));
    const clasificacion = String(
      picked.clasificacion ||
        (score >= 70 ? "caliente" : score >= 30 ? "templado" : "frio")
    )
      .toLowerCase()
      .slice(0, 40);

    const payload: Record<string, unknown> = {
      nombre: String(picked.nombre || "Lead web").slice(0, 120),
      email,
      empresa: String(picked.empresa || "").slice(0, 120),
      mensaje: String(picked.mensaje || "").slice(0, 4000),
      tipo_interes: String(picked.tipo_interes || "web").slice(0, 120),
      fuente: String(picked.fuente || "web").slice(0, 80),
      score,
      clasificacion,
      prioridad: String(
        picked.prioridad ||
          (clasificacion === "caliente"
            ? "alta"
            : clasificacion === "templado"
              ? "media"
              : "baja")
      ).slice(0, 40),
      estado: String(picked.estado || "nuevo").slice(0, 40),
      auto_respuesta: String(picked.auto_respuesta || "").slice(0, 2000),
      ultimo_contacto: picked.ultimo_contacto || new Date().toISOString(),
    };

    if (picked.telefono) {
      payload.telefono = String(picked.telefono).slice(0, 40);
    }

    await insertLead(payload);
    const event =
      clasificacion === "caliente" || score >= 70 ? "lead.hot" : "lead.created";
    await forwardToN8n(event, {
      email,
      fuente: payload.fuente,
      tipo_interes: payload.tipo_interes,
      score,
      clasificacion,
    });

    return withCors(req, NextResponse.json({ ok: true }));
  } catch (err: unknown) {
    const e = err as ApiError;
    console.error("lead route error", e.code || e.message);
    const status =
      e.status && e.status >= 400 && e.status < 600 ? e.status : 500;
    return withCors(
      req,
      NextResponse.json(
        {
          ok: false,
          error: "No se pudo procesar la solicitud",
        },
        { status }
      )
    );
  }
}
