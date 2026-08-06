/**
 * Client bridge: AltivoxAI → /api/n8n → n8n Webhook
 * Usage: AltivoxN8n.emit("lead.created", leadObject)
 * Auth: setAuthToken(supabaseAccessToken) from admin panel session.
 */
(function (global) {
  var ENDPOINT = "/api/n8n";
  var authToken = null;

  function setAuthToken(token) {
    authToken = token || null;
  }

  function emit(event, data, opts) {
    opts = opts || {};
    var payload = {
      action: "emit",
      event: event,
      data: data || {},
      test: Boolean(opts.test)
    };
    var headers = { "Content-Type": "application/json" };
    if (authToken) headers.Authorization = "Bearer " + authToken;
    return fetch(ENDPOINT, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
      keepalive: true
    })
      .then(function (res) {
        return res.json().then(function (json) {
          return { ok: res.ok, status: res.status, json: json };
        });
      })
      .catch(function (err) {
        console.warn("[AltivoxN8n] emit failed", event, err);
        return { ok: false, error: String(err && err.message ? err.message : err) };
      });
  }

  function ping(from) {
    return emit("system.ping", { message: "pong", from: from || "browser" });
  }

  function status() {
    return fetch(ENDPOINT, { method: "GET" })
      .then(function (r) {
        return r.json();
      })
      .catch(function (err) {
        return { ok: false, error: String(err && err.message ? err.message : err) };
      });
  }

  function leadCreated(lead) {
    var ev =
      lead &&
      (String(lead.clasificacion || "").toLowerCase() === "caliente" ||
        Number(lead.score || 0) >= 70)
        ? "lead.hot"
        : "lead.created";
    return emit(ev, lead);
  }

  function leadUpdated(lead, patch) {
    var event = "lead.updated";
    if (patch && String(patch.estado || "").toLowerCase() === "contactado") {
      event = "lead.contacted";
    }
    return emit(event, { lead: lead, patch: patch || {} });
  }

  function clienteEvent(name, cliente) {
    return emit(name, cliente);
  }

  global.AltivoxN8n = {
    emit: emit,
    ping: ping,
    status: status,
    setAuthToken: setAuthToken,
    leadCreated: leadCreated,
    leadUpdated: leadUpdated,
    clienteEvent: clienteEvent
  };
})(typeof window !== "undefined" ? window : globalThis);
