/**
 * Altivox Admin core — shared auth, helpers, CSV, settings.
 */
(function (global) {
  var SUPABASE_URL = "https://soeyfivsuwohuuzgfqar.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_EwdS78d3p42NWVgrGwU6gQ_7leqHOF2";

  var NAV = [
    { href: "dashboard.html", label: "Dashboard", id: "dashboard" },
    { href: "clientes.html", label: "Clientes", id: "clientes" },
    { href: "chatbot.html", label: "Chatbot", id: "chatbot" },
    { href: "jarvis.html", label: "J.A.R.V.I.S.", id: "jarvis" },
    { href: "agentes.html", label: "Agentes IA", id: "agentes" },
    { href: "ajustes.html", label: "Ajustes", id: "ajustes" },
  ];

  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function createClient() {
    if (!global.supabase || !global.supabase.createClient) {
      throw new Error("Supabase CDN no cargado");
    }
    return global.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  function fmtDate(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return String(iso);
    }
  }

  function money(n) {
    return Number(n || 0).toLocaleString("es-ES", { maximumFractionDigits: 0 });
  }

  function hasRealEmail(email) {
    var e = String(email || "").toLowerCase();
    if (!e || e.indexOf("@") < 0) return false;
    return e.indexOf("@pending.altivoxai") < 0 && e.indexOf("chat+") !== 0;
  }

  function waLink(phone, text) {
    var digits = String(phone || "").replace(/[^\d]/g, "");
    if (!digits) return null;
    var q = text ? "?text=" + encodeURIComponent(text) : "";
    return "https://wa.me/" + digits + q;
  }

  function downloadCsv(filename, rows, columns) {
    var cols = columns || (rows[0] ? Object.keys(rows[0]) : []);
    function cell(v) {
      var s = String(v == null ? "" : v).replace(/"/g, '""');
      return '"' + s + '"';
    }
    var lines = [cols.join(",")].concat(
      rows.map(function (r) {
        return cols.map(function (c) { return cell(r[c]); }).join(",");
      })
    );
    var blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function renderShell(activeId) {
    var aside = document.getElementById("admin-sidebar");
    if (!aside) return;
    var links = NAV.map(function (item) {
      var cls = item.id === activeId ? " active" : "";
      return '<a class="' + cls.trim() + '" href="' + item.href + '">' + esc(item.label) + "</a>";
    }).join("");
    aside.innerHTML =
      '<div class="brand">' +
        '<img src="/favicon.png" alt="AltivoxAi" width="34" height="34">' +
        '<div><div class="brand-text">ALTIVOX<span>AI</span></div><span class="brand-sub">Ops Panel</span></div>' +
      "</div>" +
      links +
      '<div class="sidebar-foot"><a href="/" target="_blank" rel="noopener">Ver web pública →</a></div>';
  }

  async function syncOpsSession(accessToken) {
    if (!accessToken) return { ok: false, status: 0 };
    try {
      var res = await fetch("/api/ops/session", {
        method: "POST",
        headers: { Authorization: "Bearer " + accessToken },
      });
      var data = await res.json().catch(function () { return {}; });
      return { ok: res.ok, status: res.status, data: data };
    } catch (e) {
      return { ok: false, status: 0, error: String(e && e.message || e) };
    }
  }

  async function clearOpsSession() {
    try {
      await fetch("/api/ops/session", { method: "DELETE" });
    } catch (e) {}
  }

  async function requireAuth(sb, emailEl) {
    var res = await sb.auth.getSession();
    if (res.error || !res.data.session) {
      window.location.href = "login.html";
      return null;
    }
    var session = res.data.session;
    var sync = await syncOpsSession(session.access_token);
    if (!sync.ok) {
      await sb.auth.signOut().catch(function () {});
      await clearOpsSession();
      var q = sync.status === 403 ? "error=forbidden" : "error=auth_required";
      window.location.href = "login.html?" + q;
      return null;
    }
    var email = session.user && session.user.email;
    if (emailEl && email) emailEl.textContent = email;
    if (sync.data && sync.data.user && sync.data.user.role && emailEl) {
      emailEl.textContent = email + " · " + sync.data.user.role;
    }
    if (global.AltivoxN8n && global.AltivoxN8n.setAuthToken) {
      global.AltivoxN8n.setAuthToken(session.access_token);
    }
    sb.auth.onAuthStateChange(function (_event, next) {
      if (global.AltivoxN8n && global.AltivoxN8n.setAuthToken) {
        global.AltivoxN8n.setAuthToken(next && next.access_token ? next.access_token : null);
      }
      if (next && next.access_token) syncOpsSession(next.access_token);
      else clearOpsSession();
    });
    return session;
  }

  async function logout(sb) {
    await clearOpsSession();
    await sb.auth.signOut();
    window.location.href = "login.html";
  }

  var DEFAULT_SITE = {
    brand: {
      name: "AltivoxAi",
      mark: "ALTIVOXAI",
      tagline: "AI-Native Studio",
      email: "info@altivoxai.es",
      whatsapp: "34600000000",
    },
    hero: {
      title: "Más leads.",
      titleAccent: "Menos trabajo manual",
      cta1: "Ver ofertas y precios",
      cta2: "Reservar llamada gratis",
      risk: "Riesgo bajo · Precio cerrado · Entrega en días, no meses",
    },
    contact: {
      email: "info@altivoxai.es",
      whatsapp: "34600000000",
      whatsappLabel: "Solicita una reunión",
    },
    flags: {
      chatEnabled: true,
      bookingEnabled: true,
      leadMagnetEnabled: true,
      stickyCtaEnabled: true,
    },
    social: {
      linkedin: "",
      instagram: "",
      x: "",
    },
  };

  async function loadSiteSettings(sb) {
    try {
      var res = await sb.from("site_settings").select("key,value");
      if (res.error) return { ok: false, error: res.error.message, data: DEFAULT_SITE };
      var map = {};
      (res.data || []).forEach(function (row) {
        map[row.key] = row.value;
      });
      return {
        ok: true,
        data: {
          brand: Object.assign({}, DEFAULT_SITE.brand, map.brand || {}),
          hero: Object.assign({}, DEFAULT_SITE.hero, map.hero || {}),
          contact: Object.assign({}, DEFAULT_SITE.contact, map.contact || {}),
          flags: Object.assign({}, DEFAULT_SITE.flags, map.flags || {}),
          social: Object.assign({}, DEFAULT_SITE.social, map.social || {}),
        },
      };
    } catch (e) {
      return { ok: false, error: String(e.message || e), data: DEFAULT_SITE };
    }
  }

  async function saveSiteSettings(sb, data) {
    var rows = ["brand", "hero", "contact", "flags", "social"].map(function (key) {
      return {
        key: key,
        value: data[key] || {},
        updated_at: new Date().toISOString(),
      };
    });
    var res = await sb.from("site_settings").upsert(rows, { onConflict: "key" });
    if (res.error) throw res.error;
    return true;
  }

  global.AltivoxAdmin = {
    SUPABASE_URL: SUPABASE_URL,
    SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
    DEFAULT_SITE: DEFAULT_SITE,
    esc: esc,
    createClient: createClient,
    fmtDate: fmtDate,
    money: money,
    hasRealEmail: hasRealEmail,
    waLink: waLink,
    downloadCsv: downloadCsv,
    renderShell: renderShell,
    requireAuth: requireAuth,
    logout: logout,
    loadSiteSettings: loadSiteSettings,
    saveSiteSettings: saveSiteSettings,
  };
})(typeof window !== "undefined" ? window : globalThis);
