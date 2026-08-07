/**
 * Fox-body Mustang GT (~1990) scroll landing — GLB mesh + GLTFLoader.
 */

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Same-origin after deploy; jsDelivr covers Ops before/without local assets. */
const MODEL_LOCAL = "/assets/encargos/mustang/foxbody.glb";
const MODEL_CDN =
  "https://cdn.jsdelivr.net/gh/DigitalNexoraOficial/AltivoxAi@cursor/encargo-landing-mustang-fix-4521/public/assets/encargos/mustang/foxbody.glb";

export function buildMustangPhotoLandingHtml(input: {
  clientName: string;
  carTitle: string;
}): string {
  const brand = escapeHtml(input.clientName || "Altivox");
  const carTitle = escapeHtml(input.carTitle || "Ford Mustang GT 1990");
  const titleJson = JSON.stringify(input.carTitle || "Ford Mustang GT 1990");
  const localJson = JSON.stringify(MODEL_LOCAL);
  const cdnJson = JSON.stringify(MODEL_CDN);

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
    --bg: #07080c; --text: #f3f0ea; --muted: #9a958c;
    --accent: #c45c26; --steel: #d7dde8;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; color: var(--text);
    font-family: "DM Sans", system-ui, sans-serif;
    background: var(--bg);
  }
  #stage {
    position: fixed; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse at 50% 72%, #1a120c 0%, transparent 55%),
      radial-gradient(circle at 78% 8%, rgba(196,92,38,.16), transparent 42%),
      linear-gradient(180deg, #0c0e14, #050507 72%);
  }
  #stage canvas { display: block; width: 100%; height: 100%; }
  #stage-msg {
    position: absolute; inset: 0; display: grid; place-items: center;
    color: var(--muted); font-size: 14px; padding: 24px; text-align: center;
  }
  #stage-msg[hidden] { display: none; }
  .scroll-track { position: relative; z-index: 1; height: 540vh; pointer-events: none; }
  .hud {
    position: fixed; inset: 0; z-index: 2; pointer-events: none;
    display: grid; align-content: space-between;
    padding: clamp(18px, 4vw, 40px);
  }
  .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
  .brand {
    font-family: "Bebas Neue", Impact, sans-serif;
    letter-spacing: .14em; font-size: clamp(1.4rem, 3vw, 2rem);
  }
  .progress {
    width: min(180px, 36vw); height: 2px; background: rgba(243,240,234,.15);
    margin-top: 12px; overflow: hidden;
  }
  .progress > i { display: block; height: 100%; width: 0%; background: var(--accent); }
  .copy { max-width: 28rem; transition: opacity .35s ease, transform .35s ease; }
  .copy .kicker {
    color: var(--accent); text-transform: uppercase; letter-spacing: .16em;
    font-size: 11px; font-weight: 700; margin-bottom: 10px;
  }
  .copy h1 {
    font-family: "Bebas Neue", Impact, sans-serif;
    font-size: clamp(2.4rem, 7vw, 4.8rem);
    line-height: .92; margin: 0 0 12px;
  }
  .copy p { margin: 0; color: var(--muted); line-height: 1.55; font-size: 0.98rem; }
  .hint {
    justify-self: end; align-self: end;
    color: var(--muted); font-size: 12px; letter-spacing: .12em; text-transform: uppercase;
  }
  .hint span { color: var(--steel); }
  .credit {
    position: fixed; left: clamp(18px, 4vw, 40px); bottom: clamp(18px, 4vw, 40px);
    z-index: 2; font-size: 10px; color: rgba(154,149,140,.75); max-width: 18rem; line-height: 1.35;
  }
  @media (max-width: 720px) {
    .top { flex-direction: column; }
    .hint { justify-self: start; margin-bottom: 36px; }
  }
</style>
</head>
<body>
  <div id="stage" aria-hidden="true">
    <div id="stage-msg">Cargando modelo 3D Ford Mustang GT Fox-body…</div>
  </div>
  <div class="scroll-track" aria-hidden="true"></div>
  <div class="hud">
    <div class="top">
      <div>
        <div class="brand">${brand}</div>
        <div class="progress" aria-hidden="true"><i id="bar"></i></div>
      </div>
      <div class="copy" id="copy">
        <div class="kicker" id="kicker">Modelo 3D · Fox-body</div>
        <h1 id="headline">${carTitle}</h1>
        <p id="sub">Mustang GT generación Fox-body (~1990). Desplaza: puertas, interior, luna y capó/motor.</p>
      </div>
    </div>
    <div class="hint">Desplaza · <span id="beat">Exterior</span></div>
  </div>
  <p class="credit">Ford Mustang GT Fox-body (~1990) · GLB animado con scroll</p>
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
  }
}
</script>
<script type="module">
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const msg = document.getElementById("stage-msg");
function fail(t) { if (msg) { msg.hidden = false; msg.textContent = t; } }

const LOCAL = ${localJson};
const CDN = ${cdnJson};
const TITLE = ${titleJson};
const scenes = [
  { k: "01 · Exterior", h: TITLE, s: "Fox-body GT en escena. Gira y observa el capó largo.", beat: "Exterior" },
  { k: "02 · Puertas", h: "Puertas abiertas", s: "Conductor y copiloto se abren con el scroll.", beat: "Puertas" },
  { k: "03 · Interior", h: "Cabina", s: "Entra al habitáculo.", beat: "Interior" },
  { k: "04 · Luna", h: "Parabrisas", s: "La cámara sale por la luna delantera.", beat: "Luna" },
  { k: "05 · Motor", h: "Capó abierto", s: "Vista superior: capó y bloque motor.", beat: "Motor" }
];

const stage = document.getElementById("stage");
const bar = document.getElementById("bar");
const kicker = document.getElementById("kicker");
const headline = document.getElementById("headline");
const sub = document.getElementById("sub");
const beatEl = document.getElementById("beat");
const copy = document.getElementById("copy");
let sceneIdx = 0;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
} catch (e) {
  fail("WebGL no disponible.");
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.setSize(innerWidth, innerHeight);
if (renderer.outputColorSpace !== undefined) renderer.outputColorSpace = THREE.SRGBColorSpace;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.05, 80);
camera.position.set(5.2, 1.9, 6.4);

scene.add(new THREE.HemisphereLight(0xf5efe6, 0x1a120c, 1.1));
const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(6, 9, 4);
scene.add(key);
const rim = new THREE.DirectionalLight(0xc45c26, 0.55);
rim.position.set(-6, 3, -3);
scene.add(rim);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(22, 64),
  new THREE.MeshStandardMaterial({ color: 0x101218, metalness: 0.3, roughness: 0.88 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.02;
scene.add(floor);

const carRoot = new THREE.Group();
scene.add(carRoot);

let doorL = null, doorR = null, hoodPivot = null, engine = null;

function findNamed(root, name) {
  let found = null;
  root.traverse((o) => { if (o.name === name) found = o; });
  return found;
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function smoothstep(a, b, x) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}
function mix(a, b, t) {
  return new THREE.Vector3(lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.z, b.z, t));
}

function setCopy(i) {
  if (i === sceneIdx) return;
  sceneIdx = i;
  copy.style.opacity = "0";
  copy.style.transform = "translateY(10px)";
  setTimeout(() => {
    kicker.textContent = scenes[i].k;
    headline.textContent = scenes[i].h;
    sub.textContent = scenes[i].s;
    beatEl.textContent = scenes[i].beat;
    copy.style.opacity = "1";
    copy.style.transform = "translateY(0)";
  }, 150);
}

const camA = new THREE.Vector3(5.2, 1.9, 6.4);
const camB = new THREE.Vector3(3.4, 1.5, 4.8);
const camC = new THREE.Vector3(-0.2, 1.05, 0.15);
const camD = new THREE.Vector3(3.0, 1.25, 0.05);
const camE = new THREE.Vector3(1.4, 4.8, 0.25);
const lookA = new THREE.Vector3(0.1, 0.55, 0);
const lookB = new THREE.Vector3(0.2, 0.55, 0);
const lookC = new THREE.Vector3(-0.3, 0.55, 0);
const lookD = new THREE.Vector3(1.6, 0.55, 0);
const lookE = new THREE.Vector3(1.15, 0.35, 0);

function applyScroll(p, idle) {
  bar.style.width = (p * 100).toFixed(1) + "%";
  const doors = smoothstep(0.12, 0.34, p);
  if (doorL) doorL.rotation.y = doors * 1.15;
  if (doorR) doorR.rotation.y = -doors * 1.15;
  const hood = smoothstep(0.72, 0.92, p);
  if (hoodPivot) hoodPivot.rotation.z = -hood * 0.95;
  if (engine) engine.visible = p > 0.66;

  let pos, look, idx;
  if (p < 0.18) {
    idx = 0;
    const t = p / 0.18;
    pos = mix(camA, camB, t);
    look = mix(lookA, lookB, t);
    carRoot.rotation.y = lerp(0.55 + idle, -0.1, t);
  } else if (p < 0.38) {
    idx = 1;
    const t2 = (p - 0.18) / 0.2;
    pos = mix(camB, new THREE.Vector3(2.3, 1.25, 3.6), t2);
    look = lookB;
    carRoot.rotation.y = lerp(-0.1, 0, t2);
  } else if (p < 0.58) {
    idx = 2;
    const t3 = (p - 0.38) / 0.2;
    pos = mix(new THREE.Vector3(2.3, 1.25, 3.6), camC, t3);
    look = mix(lookB, lookC, t3);
    carRoot.rotation.y = 0;
  } else if (p < 0.76) {
    idx = 3;
    const t4 = (p - 0.58) / 0.18;
    pos = mix(camC, camD, t4);
    look = mix(lookC, lookD, t4);
  } else {
    idx = 4;
    const t5 = clamp((p - 0.76) / 0.24, 0, 1);
    pos = mix(camD, camE, t5);
    look = mix(lookD, lookE, t5);
  }
  camera.position.copy(pos);
  camera.lookAt(look);
  setCopy(idx);
}

function progress() {
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  return clamp(scrollY / max, 0, 1);
}

let target = 0, current = 0, t0 = performance.now(), ready = false;
const loader = new GLTFLoader();

function onModel(gltf) {
  const model = gltf.scene;
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);
  model.position.sub(center);
  model.scale.setScalar(4.6 / Math.max(size.x, size.y, size.z, 0.001));
  box.setFromObject(model);
  model.position.y -= box.min.y;
  carRoot.add(model);
  doorL = findNamed(model, "DoorLPivot");
  doorR = findNamed(model, "DoorRPivot");
  hoodPivot = findNamed(model, "HoodPivot");
  engine = findNamed(model, "Engine");
  if (engine) engine.visible = false;
  if (msg) msg.hidden = true;
  ready = true;
}

loader.load(LOCAL, onModel, undefined, () => {
  loader.load(CDN, onModel, undefined, () => fail("No se pudo cargar el GLB del Mustang."));
});

addEventListener("scroll", () => { target = progress(); }, { passive: true });
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

function tick(now) {
  current += (target - current) * 0.08;
  const idle = current < 0.02 ? Math.sin((now - t0) * 0.00045) * 0.22 : 0;
  if (ready) applyScroll(current, idle);
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
</script>
</body>
</html>`;
}
