/**
 * AltivoxAI ↔ n8n bridge
 *
 * Env (Vercel):
 *   N8N_WEBHOOK_URL   – Production Webhook URL from n8n (required for emit)
 *   N8N_WEBHOOK_TEST  – Optional test URL
 *   N8N_SECRET        – Shared secret for inbound calls (header x-altivox-secret)
 *   SUPABASE_URL      – Optional; defaults to project URL
 *   SUPABASE_SERVICE_ROLE_KEY – Required for inbound write actions
 *
 * POST /api/n8n
 *   { "action": "emit", "event": "lead.created", "data": {...} }
 *   { "action": "ping" }
 *   { "action": "update_lead", "id": "...", "patch": {...} }   // inbound
 *   { "action": "create_cliente", "data": {...} }              // inbound
 *   { "action": "update_cliente", "id": "...", "patch": {...} }// inbound
 */

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://soeyfivsuwohuuzgfqar.supabase.co";

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, x-altivox-secret, Authorization"
  );
}

function okSecret(req) {
  const expected = process.env.N8N_SECRET;
  if (!expected) return false;
  const got =
    req.headers["x-altivox-secret"] ||
    (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  return got && got === expected;
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
      Prefer: method === "POST" ? "return=representation" : "return=representation"
    },
    body: body ? JSON.stringify(body) : undefined
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
    data: data || {}
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Altivox-Event": payload.event,
      ...(process.env.N8N_SECRET
        ? { "x-altivox-secret": process.env.N8N_SECRET }
        : {})
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  return {
    forwarded: true,
    status: res.status,
    ok: res.ok,
    body: text ? text.slice(0, 500) : ""
  };
}

export default async function handler(req, res) {
  cors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({
      service: "altivox-n8n",
      ok: true,
      emitConfigured: Boolean(process.env.N8N_WEBHOOK_URL),
      inboundSecretConfigured: Boolean(process.env.N8N_SECRET),
      supabaseWriteConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      events: [
        "lead.created",
        "lead.updated",
        "lead.contacted",
        "lead.hot",
        "cliente.created",
        "cliente.updated",
        "cliente.deleted",
        "cliente.touched",
        "jarvis.rescored",
        "system.ping"
      ]
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
          ? { message: "pong", from: body.from || "api" }
          : body.data || {};

      // Public emit is OK (no secret) so the website can notify n8n.
      // Optional: require secret if N8N_REQUIRE_SECRET=1
      if (process.env.N8N_REQUIRE_SECRET === "1" && !okSecret(req)) {
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
            hint: "En Vercel → Settings → Environment Variables → N8N_WEBHOOK_URL"
          });
        }
        throw e;
      }
    }

    // --- Inbound actions from n8n ---
    if (!okSecret(req)) {
      return res.status(401).json({
        error: "Falta o es inválido x-altivox-secret",
        hint: "Define N8N_SECRET en Vercel y el mismo valor en el nodo HTTP Request de n8n"
      });
    }

    if (action === "update_lead") {
      if (!body.id || !body.patch || typeof body.patch !== "object") {
        return res.status(400).json({ error: "Requiere id y patch" });
      }
      const data = await supabaseRest("leads?id=eq." + encodeURIComponent(body.id), {
        method: "PATCH",
        body: body.patch
      });
      return res.status(200).json({ ok: true, data });
    }

    if (action === "create_cliente") {
      if (!body.data || typeof body.data !== "object") {
        return res.status(400).json({ error: "Requiere data" });
      }
      const data = await supabaseRest("clientes", {
        method: "POST",
        body: body.data
      });
      return res.status(200).json({ ok: true, data });
    }

    if (action === "update_cliente") {
      if (!body.id || !body.patch || typeof body.patch !== "object") {
        return res.status(400).json({ error: "Requiere id y patch" });
      }
      const data = await supabaseRest(
        "clientes?id=eq." + encodeURIComponent(body.id),
        { method: "PATCH", body: body.patch }
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
        "update_cliente"
      ]
    });
  } catch (e) {
    console.error("n8n bridge error", e);
    return res.status(500).json({
      error: e.message || "Error interno",
      code: e.code || null
    });
  }
}
