/**
 * Public lead capture for website forms (guía, calculadora, etc.)
 *
 * Env (Vercel):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  – preferred (bypasses RLS)
 *   SUPABASE_ANON_KEY          – fallback if service role missing + RLS allows anon insert
 *   N8N_WEBHOOK_URL            – forward lead.created / lead.hot
 */

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
];

const rateBucket = new Map();

function pickOrigin(req) {
  const origin = String(req.headers.origin || "");
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  return ALLOWED_ORIGINS[0];
}

function cors(req, res) {
  res.setHeader("Access-Control-Allow-Origin", pickOrigin(req));
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function clientIp(req) {
  const xf = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return xf || req.socket?.remoteAddress || "unknown";
}

function rateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxHits = 30;
  const entry = rateBucket.get(ip) || { count: 0, start: now };
  if (now - entry.start > windowMs) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  rateBucket.set(ip, entry);
  return entry.count <= maxHits;
}

function pickAllowedFields(input) {
  const out = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) return out;
  for (const key of LEAD_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(input, key) && input[key] !== undefined) {
      out[key] = input[key];
    }
  }
  return out;
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase()
    .slice(0, 200);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function supabaseKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    // Same publishable key already used by the public website (anon).
    // Works when RLS policy anon_insert_leads + GRANT INSERT are applied.
    "sb_publishable_EwdS78d3p42NWVgrGwU6gQ_7leqHOF2"
  );
}

async function insertLead(payload) {
  const key = supabaseKey();
  if (!key) {
    const err = new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY (o SUPABASE_ANON_KEY) en Vercel"
    );
    err.code = "NO_KEY";
    throw err;
  }

  const res = await fetch(SUPABASE_URL + "/rest/v1/leads", {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_) {
    data = text;
  }

  if (!res.ok) {
    const err = new Error(
      (data && data.message) || (data && data.error) || text || "Supabase error"
    );
    err.status = res.status;
    err.code = "SUPABASE";
    err.details = data;
    throw err;
  }

  return Array.isArray(data) ? data[0] : data;
}

async function forwardToN8n(event, data) {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) return { forwarded: false, reason: "NO_WEBHOOK" };

  const payload = {
    source: "altivoxai",
    event: event || "lead.created",
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
    body: text ? text.slice(0, 300) : "",
  };
}

export default async function handler(req, res) {
  cors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!rateLimit(clientIp(req))) {
    return res.status(429).json({ error: "Demasiadas peticiones. Espera un minuto." });
  }

  try {
    const body = req.body || {};
    const email = normalizeEmail(body.email);
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    const picked = pickAllowedFields(body);
    const score = Math.max(0, Math.min(100, Number(picked.score ?? 55) || 55));
    const clasificacion = String(
      picked.clasificacion ||
        (score >= 70 ? "caliente" : score >= 30 ? "templado" : "frio")
    )
      .toLowerCase()
      .slice(0, 40);

    const payload = {
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

    const lead = await insertLead(payload);
    const event =
      clasificacion === "caliente" || score >= 70 ? "lead.hot" : "lead.created";
    const n8n = await forwardToN8n(event, lead);

    return res.status(200).json({
      ok: true,
      lead,
      n8n,
      event,
    });
  } catch (err) {
    const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
    return res.status(status).json({
      ok: false,
      error: err.message || "Error creando lead",
      code: err.code || "ERROR",
      hint:
        err.code === "NO_KEY"
          ? "En Vercel → Settings → Environment Variables añade SUPABASE_SERVICE_ROLE_KEY"
          : err.code === "SUPABASE"
            ? "Revisa RLS/policies de leads o usa SUPABASE_SERVICE_ROLE_KEY"
            : undefined,
    });
  }
}
