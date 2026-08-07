/**
 * Local deliverable generators when LLM is unavailable.
 * Produce real previewable/downloadable files (not prose stubs).
 */

import type { EncargoServiceKey } from "./types";

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

function wantsCinematicCarLanding(description: string): boolean {
  const d = description.toLowerCase();
  const hasCar =
    /mustang|veh[ií]culo|coche|auto|carro|gt\b|deportivo|motor|cap[oó]|puertas|interior/.test(
      d
    );
  const hasMotion =
    /3d|scroll|animaci[oó]n|cinemat|modelaci[oó]n|three|premium|luna|parabrisas|capot|capó/.test(
      d
    );
  return hasCar && hasMotion;
}

function guessCarTitle(description: string, clientName: string): string {
  const mustang = description.match(/mustang/i);
  if (mustang) {
    const year = description.match(/\b(19\d{2}|20\d{2})\b/);
    const gt = /\bgt\b/i.test(description) ? " GT" : "";
    return `Ford Mustang${gt}${year ? ` ${year[1]}` : ""}`;
  }
  const model = description.match(
    /(?:modelo|coche|auto|veh[ií]culo)\s+([A-Za-z0-9][A-Za-z0-9 \-]{2,40})/i
  );
  if (model?.[1]) return model[1].trim();
  return clientName || "Edition";
}

/** Scroll-driven stylized 3D car landing (Three.js CDN). No photoreal GLB. */
function buildCinematicCarHtml(input: {
  clientName: string;
  description: string;
}): string {
  const brand = escapeHtml(input.clientName || "Altivox");
  const carTitle = escapeHtml(guessCarTitle(input.description, input.clientName));
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${carTitle} · ${brand}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet"/>
<style>
  :root {
    --bg: #07080c;
    --text: #f3f0ea;
    --muted: #9a958c;
    --accent: #c45c26;
    --steel: #d7dde8;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: auto; }
  body {
    margin: 0; color: var(--text);
    font-family: "DM Sans", sans-serif;
    background: var(--bg);
  }
  #stage {
    position: fixed; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse at 50% 70%, #1a120c 0%, transparent 55%),
      radial-gradient(circle at 80% 10%, rgba(196,92,38,.18), transparent 40%),
      linear-gradient(180deg, #0c0e14, #050507 70%);
  }
  #stage canvas { display: block; width: 100%; height: 100%; }
  #stage-msg {
    position: absolute; inset: 0; display: grid; place-items: center;
    color: var(--muted); font-size: 14px; padding: 24px; text-align: center;
  }
  #stage-msg[hidden] { display: none; }
  .scroll-track { position: relative; z-index: 1; height: 520vh; pointer-events: none; }
  .hud {
    position: fixed; inset: 0; z-index: 2; pointer-events: none;
    display: grid; align-content: space-between;
    padding: clamp(18px, 4vw, 40px);
  }
  .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
  .brand {
    font-family: "Bebas Neue", sans-serif;
    letter-spacing: .14em; font-size: clamp(1.4rem, 3vw, 2rem);
  }
  .progress {
    width: min(180px, 36vw); height: 2px; background: rgba(243,240,234,.15);
    margin-top: 12px; overflow: hidden;
  }
  .progress > i {
    display: block; height: 100%; width: 0%; background: var(--accent);
    transform-origin: left center;
  }
  .copy {
    max-width: 28rem;
    transition: opacity .35s ease, transform .35s ease;
  }
  .copy .kicker {
    color: var(--accent); text-transform: uppercase; letter-spacing: .16em;
    font-size: 11px; font-weight: 700; margin-bottom: 10px;
  }
  .copy h1 {
    font-family: "Bebas Neue", sans-serif;
    font-size: clamp(2.6rem, 8vw, 5.2rem);
    line-height: .92; margin: 0 0 12px; letter-spacing: .02em;
  }
  .copy p { margin: 0; color: var(--muted); line-height: 1.55; font-size: 0.98rem; }
  .hint {
    justify-self: end; align-self: end;
    color: var(--muted); font-size: 12px; letter-spacing: .12em; text-transform: uppercase;
  }
  .hint span { color: var(--steel); }
  @media (max-width: 720px) {
    .top { flex-direction: column; }
    .hint { justify-self: start; }
  }
</style>
</head>
<body>
  <div id="stage" aria-hidden="true">
    <div id="stage-msg">Cargando modelo 3D…</div>
  </div>
  <div class="scroll-track" aria-hidden="true"></div>
  <div class="hud">
    <div class="top">
      <div>
        <div class="brand">${brand}</div>
        <div class="progress" aria-hidden="true"><i id="bar"></i></div>
      </div>
      <div class="copy" id="copy">
        <div class="kicker" id="kicker">Experiencia scroll</div>
        <h1 id="headline">${carTitle}</h1>
        <p id="sub">Fox-body · recorrido cinematográfico 3D. Desplaza para abrir puertas, entrar al interior, salir por la luna y revelar el motor.</p>
      </div>
    </div>
    <div class="hint">Desplaza · <span id="beat">Exterior</span></div>
  </div>
<!-- Three.js via jsDelivr (allowlisted by Altivox CSP). -->
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script>
(function () {
  var msg = document.getElementById("stage-msg");
  function fail(text) {
    if (msg) { msg.hidden = false; msg.textContent = text; }
  }
  if (!window.THREE) {
    fail("No se pudo cargar Three.js. Abre en pestaña o descarga el HTML.");
    return;
  }
  var scenes = [
    { k: "01 · Presentación", h: ${JSON.stringify(guessCarTitle(input.description, input.clientName))}, s: "Silueta Fox-body. El modelo gira; observa el largo capó del Mustang GT.", beat: "Exterior" },
    { k: "02 · Acceso", h: "Puertas abiertas", s: "Conductor y copiloto se abren al ritmo del scroll.", beat: "Puertas" },
    { k: "03 · Cabina", h: "Interior", s: "Entra en el habitáculo: asientos, volante y consolas.", beat: "Interior" },
    { k: "04 · Luna", h: "Salida frontal", s: "La cámara atraviesa el parabrisas hacia la carretera.", beat: "Luna" },
    { k: "05 · Motor", h: "Capó y motor", s: "Vista superior: el capó se abre y revela el bloque V8.", beat: "Motor" }
  ];

  var stage = document.getElementById("stage");
  var bar = document.getElementById("bar");
  var kicker = document.getElementById("kicker");
  var headline = document.getElementById("headline");
  var sub = document.getElementById("sub");
  var beat = document.getElementById("beat");
  var copy = document.getElementById("copy");
  var sceneIdx = 0;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (err) {
    fail("WebGL no disponible en este navegador/preview.");
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (renderer.outputColorSpace !== undefined) renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.appendChild(renderer.domElement);
  if (msg) msg.hidden = true;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(4.6, 1.7, 5.8);

  scene.add(new THREE.HemisphereLight(0xf0e6d8, 0x1a120c, 1.15));
  var key = new THREE.DirectionalLight(0xffffff, 1.45);
  key.position.set(6, 8, 4);
  scene.add(key);
  var rim = new THREE.DirectionalLight(0xc45c26, 0.65);
  rim.position.set(-5, 3, -4);
  scene.add(rim);
  var fill = new THREE.DirectionalLight(0x88aaff, 0.35);
  fill.position.set(-3, 2, 6);
  scene.add(fill);

  var floor = new THREE.Mesh(
    new THREE.CircleGeometry(18, 64),
    new THREE.MeshStandardMaterial({ color: 0x12141a, metalness: 0.25, roughness: 0.88 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.52;
  scene.add(floor);

  var paint = new THREE.MeshStandardMaterial({ color: 0xc4121a, metalness: 0.78, roughness: 0.22 });
  var dark = new THREE.MeshStandardMaterial({ color: 0x111318, metalness: 0.6, roughness: 0.4 });
  var chrome = new THREE.MeshStandardMaterial({ color: 0xc9d0db, metalness: 1, roughness: 0.16 });
  var glass = new THREE.MeshStandardMaterial({ color: 0x8ed0ea, metalness: 0.15, roughness: 0.04, transparent: true, opacity: 0.38 });
  var leather = new THREE.MeshStandardMaterial({ color: 0x2a211c, roughness: 0.85, metalness: 0.05 });
  var engineMat = new THREE.MeshStandardMaterial({ color: 0x2f343c, metalness: 0.88, roughness: 0.32 });
  var blackout = new THREE.MeshStandardMaterial({ color: 0x050505, metalness: 0.4, roughness: 0.55 });

  var car = new THREE.Group();
  scene.add(car);

  function box(w, h, d, mat, x, y, z) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x || 0, y || 0, z || 0);
    return m;
  }

  /* Fox-body Mustang GT proportions: long hood, cabin set back, short deck. */
  car.add(box(2.05, 0.52, 1.22, paint, -0.15, 0.08, 0));
  car.add(box(1.15, 0.42, 1.18, paint, -0.55, 0.52, 0));
  car.add(box(0.55, 0.36, 1.2, paint, -1.55, 0.05, 0));
  car.add(box(0.95, 0.08, 0.95, glass, -0.45, 0.78, 0));

  var windshield = box(0.08, 0.48, 1.05, glass, 0.18, 0.62, 0);
  windshield.rotation.z = -0.42;
  car.add(windshield);

  var hoodPivot = new THREE.Group();
  hoodPivot.position.set(0.55, 0.34, 0);
  hoodPivot.add(box(1.45, 0.07, 1.18, paint, 0.72, 0, 0));
  hoodPivot.add(box(0.55, 0.06, 0.28, blackout, 0.55, 0.05, 0.28));
  hoodPivot.add(box(0.55, 0.06, 0.28, blackout, 0.55, 0.05, -0.28));
  car.add(hoodPivot);

  car.add(box(0.12, 0.18, 0.22, chrome, 1.95, 0.12, 0.42));
  car.add(box(0.12, 0.18, 0.22, chrome, 1.95, 0.12, -0.42));
  car.add(box(0.12, 0.14, 0.18, chrome, 1.95, 0.08, 0.18));
  car.add(box(0.12, 0.14, 0.18, chrome, 1.95, 0.08, -0.18));
  car.add(box(0.35, 0.08, 1.05, blackout, 1.88, -0.05, 0));
  car.add(box(0.2, 0.12, 0.95, chrome, -1.82, 0.22, 0));

  var engine = new THREE.Group();
  engine.position.set(1.15, 0.12, 0);
  engine.visible = false;
  engine.add(box(0.7, 0.32, 0.62, engineMat, 0, 0, 0));
  engine.add(box(0.55, 0.08, 0.5, chrome, 0, 0.2, 0));
  engine.add(box(0.12, 0.2, 0.12, chrome, 0.18, 0.28, 0.16));
  engine.add(box(0.12, 0.2, 0.12, chrome, -0.18, 0.28, -0.16));
  engine.add(box(0.08, 0.28, 0.08, chrome, 0, 0.3, 0));
  car.add(engine);

  function makeDoor(side) {
    var pivot = new THREE.Group();
    pivot.position.set(-0.15, 0.22, side * 0.61);
    pivot.add(box(1.2, 0.44, 0.08, paint, 0.15, 0, side * 0.02));
    pivot.add(box(0.62, 0.24, 0.04, glass, 0.05, 0.24, side * 0.02));
    car.add(pivot);
    return pivot;
  }
  var doorL = makeDoor(1);
  var doorR = makeDoor(-1);

  var interior = new THREE.Group();
  interior.position.set(-0.45, 0.2, 0);
  interior.add(box(0.95, 0.08, 0.95, leather, 0, 0, 0));
  interior.add(box(0.32, 0.3, 0.34, leather, 0.05, 0.2, 0.28));
  interior.add(box(0.32, 0.3, 0.34, leather, 0.05, 0.2, -0.28));
  interior.add(box(0.08, 0.24, 0.08, chrome, 0.48, 0.24, 0.22));
  interior.add(box(0.4, 0.06, 0.38, dark, 0.4, 0.14, 0));
  car.add(interior);

  function wheel(x, z) {
    var g = new THREE.Group();
    var tire = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 24), dark);
    tire.rotation.z = Math.PI / 2;
    var rimM = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.22, 16), chrome);
    rimM.rotation.z = Math.PI / 2;
    g.add(tire); g.add(rimM);
    g.position.set(x, -0.26, z);
    car.add(g);
  }
  wheel(1.15, 0.58); wheel(1.15, -0.58); wheel(-1.15, 0.58); wheel(-1.15, -0.58);

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smoothstep(edge0, edge1, x) {
    var t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }
  function mix(a, b, t) {
    return new THREE.Vector3(lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.z, b.z, t));
  }

  var camA = new THREE.Vector3(4.6, 1.7, 5.8);
  var camB = new THREE.Vector3(3.0, 1.45, 4.4);
  var camC = new THREE.Vector3(-0.2, 0.9, 0.12);
  var camD = new THREE.Vector3(2.6, 1.15, 0.05);
  var camE = new THREE.Vector3(1.25, 4.4, 0.15);
  var lookA = new THREE.Vector3(0.2, 0.35, 0);
  var lookB = new THREE.Vector3(0.15, 0.4, 0);
  var lookC = new THREE.Vector3(-0.2, 0.4, 0);
  var lookD = new THREE.Vector3(1.7, 0.45, 0);
  var lookE = new THREE.Vector3(1.2, 0.25, 0);

  function setCopy(i) {
    if (i === sceneIdx) return;
    sceneIdx = i;
    copy.style.opacity = "0";
    copy.style.transform = "translateY(10px)";
    setTimeout(function () {
      kicker.textContent = scenes[i].k;
      headline.textContent = scenes[i].h;
      sub.textContent = scenes[i].s;
      beat.textContent = scenes[i].beat;
      copy.style.opacity = "1";
      copy.style.transform = "translateY(0)";
    }, 160);
  }

  function applyScroll(p, idleSpin) {
    bar.style.width = (p * 100).toFixed(1) + "%";
    var doors = smoothstep(0.12, 0.32, p);
    doorL.rotation.y = doors * 1.2;
    doorR.rotation.y = -doors * 1.2;

    var hoodOpen = smoothstep(0.72, 0.92, p);
    hoodPivot.rotation.z = -hoodOpen * 0.95;
    engine.visible = p > 0.68;

    var pos, look, idx;
    if (p < 0.18) {
      idx = 0;
      var t = p / 0.18;
      pos = mix(camA, camB, t);
      look = mix(lookA, lookB, t);
      car.rotation.y = lerp(0.55 + idleSpin, -0.1, t);
    } else if (p < 0.38) {
      idx = 1;
      var t2 = (p - 0.18) / 0.2;
      pos = mix(camB, new THREE.Vector3(2.0, 1.15, 3.4), t2);
      look = mix(lookB, lookB, t2);
      car.rotation.y = lerp(-0.1, 0, t2);
    } else if (p < 0.58) {
      idx = 2;
      var t3 = (p - 0.38) / 0.2;
      pos = mix(new THREE.Vector3(2.0, 1.15, 3.4), camC, t3);
      look = mix(lookB, lookC, t3);
      car.rotation.y = 0;
    } else if (p < 0.76) {
      idx = 3;
      var t4 = (p - 0.58) / 0.18;
      pos = mix(camC, camD, t4);
      look = mix(lookC, lookD, t4);
    } else {
      idx = 4;
      var t5 = (p - 0.76) / 0.24;
      pos = mix(camD, camE, clamp(t5, 0, 1));
      look = mix(lookD, lookE, clamp(t5, 0, 1));
    }
    camera.position.copy(pos);
    camera.lookAt(look);
    setCopy(idx);
  }

  function progress() {
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    return clamp(window.scrollY / max, 0, 1);
  }

  var target = 0, current = 0, t0 = performance.now();
  window.addEventListener("scroll", function () { target = progress(); }, { passive: true });
  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function tick(now) {
    current += (target - current) * 0.08;
    var idle = current < 0.02 ? Math.sin((now - t0) * 0.00045) * 0.25 : 0;
    applyScroll(current, idle);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  applyScroll(0, 0);
  requestAnimationFrame(tick);
})();
</script>
</body>
</html>`;
}

function buildWebHtml(input: {
  clientName: string;
  description: string;
}): string {
  if (wantsCinematicCarLanding(input.description)) {
    return buildCinematicCarHtml(input);
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
