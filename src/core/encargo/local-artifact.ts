/**
 * Local deliverable generators when LLM is unavailable.
 * Produce real previewable/downloadable files (not prose stubs).
 */

import type { EncargoServiceKey } from "./types";
import {
  buildCinematic3dScrollLandingHtml,
  defaultCinematicBeats,
} from "./cinematic-3d-landing";
import { buildMustangPhotoLandingHtml } from "./mustang-landing";

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function guessBotName(description: string, clientName: string): string {
  const named = description.match(
    /(?:se\s+llame|llamarse|llamado|llamada)\s+([A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9_-]{2,40})/i
  );
  if (named?.[1]) return named[1];
  const quoted = description.match(
    /["“«]([A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9_-]{2,40})["”»]/
  );
  if (quoted?.[1]) return quoted[1];
  const first = clientName.trim().split(/\s+/)[0] || "Asistente";
  return `${first}Bot`;
}

function buildChatbotHtml(input: {
  clientName: string;
  description: string;
}): string {
  const bot = guessBotName(input.description, input.clientName);
  const brief = escapeHtml(input.description.slice(0, 280));
  const botSafe = escapeHtml(bot);
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${botSafe} · Chatbot</title>
<style>
  :root {
    --bg: #f8fafc;
    --panel: #ffffff;
    --line: #22d3ee;
    --text: #0f172a;
    --muted: #64748b;
    --accent: #06b6d4;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh;
    font-family: "Segoe UI", system-ui, sans-serif;
    background:
      radial-gradient(circle at 10% 0%, rgba(34,211,238,.18), transparent 40%),
      var(--bg);
    color: var(--text);
  }
  .demo-banner {
    padding: 14px 18px; font-size: 13px; color: var(--muted);
    border-bottom: 1px solid rgba(34,211,238,.25); background: #fff;
  }
  .page { max-width: 720px; margin: 0 auto; padding: 28px 18px 120px; }
  h1 { margin: 0 0 8px; font-size: 1.6rem; }
  p { color: var(--muted); line-height: 1.5; }
  #chat-launcher {
    position: fixed; right: 22px; bottom: 22px; z-index: 50;
    width: 58px; height: 58px; border-radius: 999px; border: 2px solid var(--line);
    background: var(--panel); color: var(--accent); font-weight: 700;
    box-shadow: 0 10px 30px rgba(6,182,212,.25); cursor: pointer;
  }
  #chat-panel {
    position: fixed; right: 22px; bottom: 92px; z-index: 50;
    width: min(360px, calc(100vw - 28px)); height: 460px;
    display: none; flex-direction: column;
    background: var(--panel); border: 2px solid var(--line); border-radius: 18px;
    box-shadow: 0 18px 50px rgba(15,23,42,.18); overflow: hidden;
  }
  #chat-panel.open { display: flex; }
  .chat-head {
    padding: 12px 14px; border-bottom: 1px solid rgba(34,211,238,.35);
    display: flex; justify-content: space-between; align-items: center;
    background: #fff;
  }
  .chat-head strong { color: var(--accent); }
  .chat-head button {
    border: 0; background: transparent; color: var(--muted); cursor: pointer; font-size: 18px;
  }
  #chat-log {
    flex: 1; overflow: auto; padding: 14px; background: #fff;
    display: flex; flex-direction: column; gap: 10px;
  }
  .msg {
    max-width: 85%; padding: 10px 12px; border-radius: 14px; font-size: 14px; line-height: 1.4;
    border: 1px solid rgba(34,211,238,.35); background: #fff;
  }
  .msg.bot { align-self: flex-start; }
  .msg.user { align-self: flex-end; background: rgba(34,211,238,.12); }
  .chat-form {
    display: flex; gap: 8px; padding: 10px; border-top: 1px solid rgba(34,211,238,.35); background: #fff;
  }
  .chat-form input {
    flex: 1; border: 1px solid rgba(34,211,238,.45); border-radius: 999px;
    padding: 10px 12px; outline: none;
  }
  .chat-form button {
    border: 0; border-radius: 999px; padding: 0 14px; background: var(--accent);
    color: #042f2e; font-weight: 700; cursor: pointer;
  }
</style>
</head>
<body>
  <div class="demo-banner">Vista previa · widget flotante (esquina inferior derecha)</div>
  <main class="page">
    <h1>Web de demostración</h1>
    <p>Brief: ${brief}</p>
    <p>El asistente <strong>${botSafe}</strong> aparece como botón flotante y permanece al hacer scroll.</p>
  </main>

  <button id="chat-launcher" type="button" aria-label="Abrir chat">${botSafe.slice(0, 2)}</button>
  <section id="chat-panel" aria-label="Chat ${botSafe}">
    <div class="chat-head">
      <strong>${botSafe}</strong>
      <button type="button" id="chat-close" aria-label="Cerrar">×</button>
    </div>
    <div id="chat-log"></div>
    <form class="chat-form" id="chat-form">
      <input id="chat-input" autocomplete="off" placeholder="Escribe un mensaje…" />
      <button type="submit">Enviar</button>
    </form>
  </section>
<script>
(function () {
  var bot = ${JSON.stringify(bot)};
  var panel = document.getElementById("chat-panel");
  var log = document.getElementById("chat-log");
  var form = document.getElementById("chat-form");
  var input = document.getElementById("chat-input");
  function add(role, text) {
    var el = document.createElement("div");
    el.className = "msg " + role;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }
  add("bot", "Hola, soy " + bot + ". ¿En qué puedo ayudarte?");
  document.getElementById("chat-launcher").onclick = function () {
    panel.classList.toggle("open");
  };
  document.getElementById("chat-close").onclick = function () {
    panel.classList.remove("open");
  };
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = (input.value || "").trim();
    if (!v) return;
    add("user", v);
    input.value = "";
    setTimeout(function () {
      add("bot", "Gracias por tu mensaje. (" + bot + " · demo local)");
    }, 350);
  });
})();
</script>
</body>
</html>`;
}

/**
 * Same trigger as the Mustang cinematic pattern, generalized to any object.
 * @see .cursor/skills/cinematic-3d-scroll-landing/SKILL.md
 */
function wantsCinematic3dLanding(description: string): boolean {
  const d = description.toLowerCase();
  const hasMotion =
    /3d|webgl|gltf|glb|three\.?js|scroll|animaci[oó]n|cinemat|modelaci[oó]n|inmersiv|recorrido|orbita/.test(
      d
    );
  const hasObject =
    /mustang|veh[ií]culo|coche|auto|carro|gt\b|deportivo|moto|reloj|zapat|sneaker|botella|perfume|producto|objeto|mueble|furniture|cap[oó]|puertas|interior|luna|parabrisas|motor|landing/.test(
      d
    );
  return hasMotion && hasObject;
}

function trimObjectTitle(raw: string): string {
  const stop =
    /\b(?:modelaci[oó]n|animaci[oó]n|scroll|cinemat|landing|premium|webgl|three|gltf|glb|3d|con|para|y)\b/i;
  const cut = raw.search(stop);
  const base = (cut > 0 ? raw.slice(0, cut) : raw).trim();
  return base.replace(/[,\.;:]+$/g, "").trim().slice(0, 48);
}

function guessObjectTitle(description: string, clientName: string): string {
  const mustang = description.match(/mustang/i);
  if (mustang) {
    const year = description.match(/\b(19\d{2}|20\d{2})\b/);
    const gt = /\bgt\b/i.test(description) ? " GT" : "";
    return `Ford Mustang${gt}${year ? ` ${year[1]}` : ""}`;
  }
  const labeled = description.match(
    /(?:modelo|producto|objeto|reloj|zapatillas?|moto|botella|perfume|coche|auto|veh[ií]culo)\s+([A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9][A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 \-]{2,60})/i
  );
  if (labeled?.[1]) {
    const title = trimObjectTitle(labeled[1]);
    if (title.length >= 2) return title;
  }
  return clientName || "Edition";
}

function slugifyObject(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "object";
}

/** Real textured GLB + WebGL scroll landing (Mustang preset or generic object swap). */
function buildCinematicObjectHtml(input: {
  clientName: string;
  description: string;
}): string {
  const title = guessObjectTitle(input.description, input.clientName);
  if (/mustang/i.test(input.description)) {
    return buildMustangPhotoLandingHtml({
      clientName: input.clientName,
      carTitle: title,
    });
  }
  const slug = slugifyObject(title);
  return buildCinematic3dScrollLandingHtml({
    brand: input.clientName || "Altivox",
    objectTitle: title,
    loadLabel: `Cargando ${title} 3D`,
    assetSlug: slug,
    modelFiles: [`${slug}.glb`],
    beats: defaultCinematicBeats(title),
    pinBranch: "main",
    openPartMeshPattern: "",
    fpsGlobal: "__cinematicFps",
  });
}

function buildWebHtml(input: {
  clientName: string;
  description: string;
}): string {
  if (wantsCinematic3dLanding(input.description)) {
    return buildCinematicObjectHtml(input);
  }
  const title = escapeHtml(input.clientName || "Landing");
  const brief = escapeHtml(input.description.slice(0, 400));
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title}</title>
<style>
  :root { --bg:#050505; --text:#f4f7fb; --muted:#9ca3af; --cyan:#22d3ee; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; color: var(--text);
    font-family: "Segoe UI", system-ui, sans-serif;
    background:
      radial-gradient(circle at 12% -8%, rgba(34,211,238,.14), transparent 42%),
      var(--bg);
  }
  .hero {
    min-height: 100vh; display: grid; align-content: center;
    padding: 48px 24px; max-width: 920px; margin: 0 auto;
  }
  .brand { color: var(--cyan); letter-spacing: .08em; text-transform: uppercase; font-size: 12px; margin-bottom: 14px; }
  h1 { font-size: clamp(2rem, 5vw, 3.4rem); margin: 0 0 14px; letter-spacing: -0.03em; }
  p { color: var(--muted); font-size: 1.05rem; line-height: 1.6; max-width: 38rem; }
  .cta {
    margin-top: 28px; display: inline-flex; padding: 12px 18px; border-radius: 999px;
    background: var(--cyan); color: #041016; font-weight: 700; text-decoration: none;
  }
</style>
</head>
<body>
  <main class="hero">
    <div class="brand">${title}</div>
    <h1>${title}</h1>
    <p>${brief}</p>
    <a class="cta" href="#contacto">Continuar</a>
  </main>
</body>
</html>`;
}

function buildAutomationJson(input: {
  clientName: string;
  description: string;
}): string {
  const payload = {
    name: `${input.clientName || "Cliente"} · automatización`,
    version: 1,
    description: input.description.slice(0, 2000),
    trigger: { type: "webhook", method: "POST", path: "/hooks/altivox" },
    steps: [
      { id: "validate", type: "function", note: "Validar payload de entrada" },
      { id: "crm", type: "http", note: "Escribir/actualizar CRM" },
      { id: "notify", type: "email", note: "Avisar al operador" },
    ],
    notes: "Borrador local Altivox OS — importable/adaptable a n8n u orquestador propio.",
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Build a fenced, previewable deliverable for a given role/service.
 * Code role always returns HTML/JSON artifact; other roles return structured prose.
 */
export function buildLocalImplementation(input: {
  role: string;
  serviceKey: EncargoServiceKey | string;
  clientName: string;
  description: string;
  proposal: string;
  reason?: string;
}): string {
  const reason = input.reason ? `\n(${input.reason.slice(0, 180)})` : "";

  if (input.role === "code") {
    if (input.serviceKey === "chatbot") {
      const html = buildChatbotHtml(input);
      return (
        `Entregable chatbot listo para preview/descarga.${reason}\n\n` +
        "```html\n" +
        html +
        "\n```"
      );
    }
    if (input.serviceKey === "automation") {
      const json = buildAutomationJson(input);
      return (
        `Entregable automatización (JSON).${reason}\n\n` +
        "```json\n" +
        json +
        "\n```"
      );
    }
    const html = buildWebHtml(input);
    return (
      `Entregable web/landing listo para preview/descarga.${reason}\n\n` +
      "```html\n" +
      html +
      "\n```"
    );
  }

  if (input.role === "design") {
    return (
      `Diseño local · ${input.serviceKey}\n` +
      `Cliente: ${input.clientName}\n` +
      `Dirección: interfaz clara, contraste alto, acento cian (#22d3ee).\n` +
      `Brief: ${input.description.slice(0, 500)}\n` +
      `Propuesta:\n${input.proposal.slice(0, 1200)}${reason}`
    );
  }

  if (input.role === "qa") {
    return (
      `QA local · checklist\n` +
      `- [PASS] Brief capturado\n` +
      `- [PASS] Entregable previewable/descargable en paso code\n` +
      `- [WARN] LLM no disponible — artifacto local\n` +
      `Servicio: ${input.serviceKey}\n${reason}`
    );
  }

  return (
    `Razonamiento local · ${input.serviceKey}\n` +
    `Objetivo: entregar ${input.serviceKey} para ${input.clientName}.\n` +
    `Brief: ${input.description.slice(0, 600)}\n` +
    `Plan: requisitos → diseño → código previewable → QA.\n${reason}`
  );
}
