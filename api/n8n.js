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

import crypto from "crypto";

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
];

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
];

function pickOrigin(req) {
  const origin = String(req.headers.origin || "");
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  return ALLOWED_ORIGINS[0];
}

function cors(req, res) {
  res.setHeader("Access-Control-Allow-Origin", pickOrigin(req));
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, x-altivox-secret, Authorization"
  );
}

function timingSafeEqual(a, b) {
  const left = Buffer.from(String(a || ""), "utf8");
  const right = Buffer.from(String(b || ""), "utf8");
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function okSecret(req) {
  const expected = process.env.N8N_SECRET;
  if (!expected) return false;
  const got =
    req.headers["x-altivox-secret"] ||
    (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  return timingSafeEqual(got, expected);
}

function pickAllowedFields(input, allowlist) {
  const out = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) return out;
  for (const key of allowlist) {
    if (Object.prototype.hasOwnProperty.call(input, key) && input[key] !== undefined) {
      out[key] = input[key];
    }
  }
  return out;
}

async function supabaseRest(path, { method = "GET", body } = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    const err = new Error("Falta SUPABASE_SERVICE_ROLE_KEY en Vercel");
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
    throw err;
  }
  return data;
}

async function forwardToN8n(event, data, test) {
  const url = test
    ? process.env.N8N_WEBHOOK_TEST || process.env.N8N_WEBHOOK_URL
    : process.env.N8N_WEBHOOK_URL;
  if (!url) {
    const err = new Error(
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
    body: text ? text.slice(0, 500) : "",
  };
}

export default async function handler(req, res) {
  cors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({
      service: "altivox-n8n",
      ok: true,
      emitConfigured: Boolean(process.env.N8N_WEBHOOK_URL),
      inboundSecretConfigured: Boolean(process.env.N8N_SECRET),
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const action = body.action || "emit";

    if (action === "ping" || action === "emit") {
      const event =
        action === "ping" ? "system.ping" : body.event || "unknown";
      const data =
        action === "ping"
          ? { message: "pong", from: String(body.from || "api").slice(0, 80) }
          : body.data || {};

      // Website may emit lead.* without secret. Everything else needs N8N_SECRET
      // (or N8N_REQUIRE_SECRET=1 to require secret even for public events).
      const publicEvents = [
        "lead.created",
        "lead.updated",
        "lead.hot",
        "system.ping",
      ];
      const mustAuth =
        process.env.N8N_REQUIRE_SECRET === "1" || !publicEvents.includes(event);
      if (mustAuth && !okSecret(req)) {
        return res.status(401).json({ error: "Secret inválido" });
      }

      try {
        const result = await forwardToN8n(event, data, Boolean(body.test));
        return res.status(200).json({ ok: true, event, ...result });
      } catch (e) {
        if (e.code === "NO_WEBHOOK") {
          return res.status(503).json({
            ok: false,
            error: e.message,
            hint: "En Vercel → Settings → Environment Variables → N8N_WEBHOOK_URL",
          });
        }
        throw e;
      }
    }

    if (!okSecret(req)) {
      return res.status(401).json({
        error: "Falta o es inválido x-altivox-secret",
        hint: "Define N8N_SECRET en Vercel y el mismo valor en el nodo HTTP Request de n8n",
      });
    }

    if (action === "update_lead") {
      if (!body.id || !body.patch || typeof body.patch !== "object") {
        return res.status(400).json({ error: "Requiere id y patch" });
      }
      const patch = pickAllowedFields(body.patch, LEAD_PATCH_FIELDS);
      if (!Object.keys(patch).length) {
        return res.status(400).json({ error: "Patch sin campos permitidos" });
      }
      const data = await supabaseRest(
        "leads?id=eq." + encodeURIComponent(String(body.id)),
        { method: "PATCH", body: patch }
      );
      return res.status(200).json({ ok: true, data });
    }

    if (action === "create_cliente") {
      if (!body.data || typeof body.data !== "object") {
        return res.status(400).json({ error: "Requiere data" });
      }
      const payload = pickAllowedFields(body.data, CLIENTE_FIELDS);
      if (!Object.keys(payload).length) {
        return res.status(400).json({ error: "Data sin campos permitidos" });
      }
      const data = await supabaseRest("clientes", {
        method: "POST",
        body: payload,
      });
      return res.status(200).json({ ok: true, data });
    }

    if (action === "update_cliente") {
      if (!body.id || !body.patch || typeof body.patch !== "object") {
        return res.status(400).json({ error: "Requiere id y patch" });
      }
      const patch = pickAllowedFields(body.patch, CLIENTE_FIELDS);
      if (!Object.keys(patch).length) {
        return res.status(400).json({ error: "Patch sin campos permitidos" });
      }
      const data = await supabaseRest(
        "clientes?id=eq." + encodeURIComponent(String(body.id)),
        { method: "PATCH", body: patch }
      );
      return res.status(200).json({ ok: true, data });
    }

    return res.status(400).json({
      error: "Acción desconocida",
      allowed: [
        "emit",
        "ping",
        "update_lead",
        "create_cliente",
        "update_cliente",
      ],
    });
  } catch (e) {
    console.error("n8n bridge error", e);
    return res.status(500).json({
      error: e.message || "Error interno",
      code: e.code || null,
    });
  }
}
