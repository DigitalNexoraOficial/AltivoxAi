/**
 * Canonical cinematic 3D scroll-landing builder.
 *
 * Same UX as the Mustang reference: sticky WebGL stage, tall scrub spacer,
 * scroll-driven camera LUT, marketing HUD beats, real textured GLB (never cubes).
 * Swap object via Cinematic3dLandingSpec (asset slug, GLBs, beats, optional lid pivot).
 */

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type CinematicBeat = {
  step: string;
  label: string;
  title: string;
  desc: string;
};

export type Cinematic3dLandingSpec = {
  brand: string;
  objectTitle: string;
  /** Loading copy under the progress bar */
  loadLabel?: string;
  /** Folder under /assets/encargos/<slug>/ */
  assetSlug: string;
  /** Preferred GLB filenames (tried in order, each with CDN fallbacks) */
  modelFiles: string[];
  beats: CinematicBeat[];
  credit?: {
    author: string;
    sourceUrl: string;
    authorUrl?: string;
  };
  /** Git branch pin for jsDelivr fallback of public assets */
  pinBranch?: string;
  /**
   * Regex (as string) for meshes attached to the openable lid/hood pivot.
   * Empty/omit = empty pivot markers only (camera-led story).
   */
  openPartMeshPattern?: string;
  openPartPivotName?: string;
  /** Global FPS counter name (default __cinematicFps) */
  fpsGlobal?: string;
};

function modelUrlCandidates(
  slug: string,
  file: string,
  pinBranch: string
): string[] {
  const repo = "digitalnexoraoficial/altivoxai";
  return [
    `https://www.altivoxai.es/assets/encargos/${slug}/${file}`,
    `/assets/encargos/${slug}/${file}`,
    `https://cdn.jsdelivr.net/gh/${repo}@${pinBranch}/public/assets/encargos/${slug}/${file}`,
  ];
}

/** Default 5-beat sales arc — adapt copy per object; keep the structure. */
export function defaultCinematicBeats(objectTitle: string): CinematicBeat[] {
  return [
    {
      step: "01",
      label: "Presencia",
      title: objectTitle,
      desc: "La silueta que para el scroll. Presencia premium para enamorar al cliente antes del primer mensaje.",
    },
    {
      step: "02",
      label: "Acceso",
      title: "El detalle que invita a acercarse",
      desc: "El momento en el que la experiencia se vuelve personal y el deseo de probarlo se dispara.",
    },
    {
      step: "03",
      label: "Interior",
      title: "El corazón del producto",
      desc: "Detalle premium en 3D: convierte curiosidad en intención de compra.",
    },
    {
      step: "04",
      label: "Mirada",
      title: "El plano heroico",
      desc: "Salimos hacia el frontal: el plano para campañas, anuncios y demos que convierten.",
    },
    {
      step: "05",
      label: "Clímax",
      title: "El argumento que cierra",
      desc: "Espectáculo técnico y comercial: el detalle final que nadie puede ignorar.",
    },
  ];
}

export function buildCinematic3dScrollLandingHtml(
  spec: Cinematic3dLandingSpec
): string {
  const brand = escapeHtml(spec.brand || "Altivox");
  const objectTitle = escapeHtml(spec.objectTitle || "Edition");
  const loadLabel = escapeHtml(spec.loadLabel || `Cargando ${spec.objectTitle} 3D`);
  const slug = spec.assetSlug.replace(/[^a-z0-9_-]/gi, "-").toLowerCase() || "object";
  const pin = spec.pinBranch || "main";
  const beats = spec.beats.length ? spec.beats : defaultCinematicBeats(spec.objectTitle);
  const beatsJson = JSON.stringify(beats);
  const urlsJson = JSON.stringify(
    spec.modelFiles.flatMap((file) => modelUrlCandidates(slug, file, pin))
  );
  const creditAuthor = escapeHtml(spec.credit?.author || "Altivox");
  const creditUrl = escapeHtml(spec.credit?.sourceUrl || "https://www.altivoxai.es");
  const openPattern = JSON.stringify(spec.openPartMeshPattern || "");
  const openPivotName = JSON.stringify(spec.openPartPivotName || "HoodPivot");
  const fpsGlobal = (spec.fpsGlobal || "__cinematicFps").replace(/[^\w$]/g, "");
  const callsGlobal = fpsGlobal.replace(/Fps$/, "Calls") || "__cinematicCalls";

  const storyHtml = beats
    .map(
      (b) => `<article class="beat">
      <div class="n">${escapeHtml(b.step)} · ${escapeHtml(b.label)}</div>
      <h2>${escapeHtml(b.title)}</h2>
      <p>${escapeHtml(b.desc)}</p>
    </article>`
    )
    .join("\n    ");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${objectTitle} · ${brand}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet"/>
<style>
  :root {
    --bg: #07080c;
    --text: #f3f0ea;
    --muted: #9a958c;
    --accent: #c45c26;
    --steel: #d7dde8;
    --line: rgba(243,240,234,.12);
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; }
  html { scroll-behavior: auto; }
  body {
    color: var(--text);
    font-family: "DM Sans", system-ui, sans-serif;
    background: var(--bg);
    overscroll-behavior-y: none;
  }
  .stage {
    position: sticky; top: 0; height: 100vh; height: 100dvh; z-index: 0;
    overflow: hidden;
    background:
      radial-gradient(ellipse 80% 55% at 55% 42%, #1a1c24 0%, #07080c 70%),
      linear-gradient(160deg, #0c0e14, #050507);
    contain: strict;
    touch-action: pan-y;
  }
  #c {
    position: absolute; inset: 0; width: 100%; height: 100%; display: block;
    transform: translateZ(0);
  }
  .stage-veil {
    position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background:
      linear-gradient(180deg, rgba(5,5,7,.42) 0%, transparent 28%, transparent 66%, rgba(5,5,7,.78) 100%),
      linear-gradient(90deg, rgba(5,5,7,.35) 0%, transparent 42%);
  }
  .hud {
    position: absolute; inset: 0; z-index: 2; pointer-events: none;
    display: grid;
    grid-template-rows: auto 1fr auto;
    padding: clamp(18px, 4vw, 40px);
    gap: 12px;
  }
  .brand {
    font-family: "Bebas Neue", Impact, sans-serif;
    letter-spacing: .14em; font-size: clamp(1.35rem, 3vw, 1.9rem);
  }
  .beat-panel {
    align-self: end;
    max-width: min(28rem, 92vw);
    transform: translateY(0);
    opacity: 1;
    transition: opacity .45s ease, transform .55s cubic-bezier(.22,1,.36,1);
    will-change: opacity, transform;
  }
  .beat-panel.is-swap {
    opacity: 0;
    transform: translateY(18px);
  }
  .beat-panel .step {
    color: var(--accent); text-transform: uppercase; letter-spacing: .16em;
    font-size: 11px; font-weight: 700; margin-bottom: 10px;
  }
  .beat-panel h2 {
    font-family: "Bebas Neue", Impact, sans-serif;
    font-size: clamp(2.2rem, 7vw, 4.2rem);
    line-height: .92; margin: 0 0 12px;
    max-width: 18ch;
  }
  .beat-panel p {
    margin: 0; color: var(--muted); line-height: 1.55;
    font-size: clamp(.95rem, 2.4vw, 1.05rem);
    max-width: 34rem;
  }
  .hud-foot {
    display: flex; justify-content: space-between; align-items: end; gap: 12px;
  }
  .hint {
    color: var(--muted);
    font-size: 12px; letter-spacing: .12em; text-transform: uppercase;
  }
  .hint span { color: var(--steel); }
  .progress {
    display: flex; gap: 6px; align-items: center;
  }
  .progress i {
    width: 18px; height: 2px; background: rgba(243,240,234,.18);
    transition: background .35s ease, width .35s ease;
  }
  .progress i.on {
    width: 28px; background: var(--accent);
  }
  .load {
    position: absolute; left: 50%; top: 52%; transform: translate(-50%,-50%);
    z-index: 3; text-align: center; pointer-events: none;
    transition: opacity .4s ease;
  }
  .load[data-done="1"] { opacity: 0; visibility: hidden; }
  .load .bar {
    width: min(220px, 50vw); height: 2px; margin: 14px auto 0;
    background: rgba(243,240,234,.12); overflow: hidden;
  }
  .load .bar i {
    display: block; height: 100%; width: 0%;
    background: linear-gradient(90deg, var(--accent), var(--steel));
  }
  .load p { margin: 0; color: var(--muted); font-size: 12px; letter-spacing: .14em; text-transform: uppercase; }
  .err {
    display: none; position: absolute; inset: auto 12% 18%; z-index: 4;
    text-align: center; color: #e8b4a0; font-size: 14px;
  }
  .scrub { position: relative; z-index: 3; height: 360vh; pointer-events: none; }
  .story {
    position: relative; z-index: 3;
    background: linear-gradient(180deg, transparent, var(--bg) 40px);
    padding: 6vh 0 16vh;
  }
  .beat {
    max-width: 720px; margin: 0 auto;
    padding: clamp(36px, 7vh, 72px) clamp(18px, 4vw, 40px);
    border-top: 1px solid var(--line);
  }
  .beat .n {
    color: var(--accent); font-size: 12px; letter-spacing: .16em;
    text-transform: uppercase; font-weight: 700; margin-bottom: 12px;
  }
  .beat h2 {
    font-family: "Bebas Neue", Impact, sans-serif;
    font-size: clamp(2rem, 5vw, 3.2rem); margin: 0 0 12px; line-height: .95;
  }
  .beat p { margin: 0; color: var(--muted); line-height: 1.6; max-width: 36rem; }
  .credit {
    max-width: 720px; margin: 0 auto;
    padding: 0 clamp(18px, 4vw, 40px);
    font-size: 12px; color: rgba(154,149,140,.85); line-height: 1.5;
  }
  .credit a { color: #c9a27a; }
  @media (max-width: 720px) {
    .hint { justify-self: start; }
    .scrub { height: 320vh; }
  }
</style>
</head>
<body>
  <section class="stage" aria-label="Modelo 3D ${objectTitle}">
    <canvas id="c"></canvas>
    <div class="stage-veil" aria-hidden="true"></div>
    <div class="load" id="load" aria-live="polite">
      <p>${loadLabel}</p>
      <div class="bar"><i id="prog"></i></div>
    </div>
    <p class="err" id="err"></p>
    <div class="hud">
      <div class="brand">${brand}</div>
      <div class="beat-panel" id="beatPanel" aria-live="polite">
        <div class="step" id="beatStep">${escapeHtml(beats[0].step)} · ${escapeHtml(beats[0].label)}</div>
        <h2 id="beatTitle">${escapeHtml(beats[0].title)}</h2>
        <p id="beatDesc">${escapeHtml(beats[0].desc)}</p>
      </div>
      <div class="hud-foot">
        <div class="progress" id="beatProgress" aria-hidden="true">
          ${beats.map((_, i) => `<i class="${i === 0 ? "on" : ""}"></i>`).join("")}
        </div>
        <div class="hint">Scroll · <span id="beatLabel">${escapeHtml(beats[0].label)}</span></div>
      </div>
    </div>
  </section>
  <div class="scrub" aria-hidden="true"></div>
  <main class="story">
    ${storyHtml}
    <p class="credit">Modelo 3D basado en trabajo de
      <a href="${creditUrl}" target="_blank" rel="noopener noreferrer">${creditAuthor}</a>
      · WebGL Altivox</p>
  </main>
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

const URLS = ${urlsJson};
const BEATS = ${beatsJson};
const OPEN_PART_PATTERN = ${openPattern};
const OPEN_PART_PIVOT = ${openPivotName};
const PATH_SAMPLES = 128;

const canvas = document.getElementById("c");
const loadEl = document.getElementById("load");
const progEl = document.getElementById("prog");
const errEl = document.getElementById("err");
const beatLabel = document.getElementById("beatLabel");
const beatPanel = document.getElementById("beatPanel");
const beatStep = document.getElementById("beatStep");
const beatTitle = document.getElementById("beatTitle");
const beatDesc = document.getElementById("beatDesc");
const beatProgress = document.getElementById("beatProgress");
const progressDots = beatProgress ? [...beatProgress.querySelectorAll("i")] : [];

function setBeat(idx) {
  const b = BEATS[idx];
  if (!b || !beatPanel) return;
  beatPanel.classList.add("is-swap");
  window.setTimeout(() => {
    beatStep.textContent = b.step + " · " + b.label;
    beatTitle.textContent = b.title;
    beatDesc.textContent = b.desc;
    beatLabel.textContent = b.label;
    progressDots.forEach((el, i) => el.classList.toggle("on", i === idx));
    beatPanel.classList.remove("is-swap");
  }, 220);
}

/* --- Renderer tuned for stable 60 FPS --- */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: false,
  alpha: false,
  powerPreference: "high-performance",
  stencil: false,
  depth: true,
});
renderer.setPixelRatio(1); // fixed: HiDPI is the #1 FPS killer here
renderer.setSize(canvas.clientWidth || innerWidth, canvas.clientHeight || innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
renderer.shadowMap.enabled = false;
renderer.info.autoReset = false;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07080c);
scene.fog = new THREE.Fog(0x07080c, 14, 40);

const camera = new THREE.PerspectiveCamera(38, 1, 0.12, 40);
camera.matrixAutoUpdate = true;

/* Cheap lighting — no env map / PMREM */
scene.add(new THREE.HemisphereLight(0xdde4f0, 0x1a120c, 0.85));
const key = new THREE.DirectionalLight(0xfff1e0, 1.75);
key.position.set(4, 6, 3);
scene.add(key);
const rim = new THREE.DirectionalLight(0x9bb7ff, 0.55);
rim.position.set(-4, 2.5, -3);
scene.add(rim);
const accentLight = new THREE.PointLight(0xffe0b0, 0, 4.5, 2);
accentLight.position.set(0, 1.35, 1.15);
scene.add(accentLight);

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(7, 24),
  new THREE.MeshBasicMaterial({ color: 0x0e1016 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const objectRoot = new THREE.Group();
scene.add(objectRoot);
/** @type {{ openPart: THREE.Group|null }} */
const rig = { openPart: null };

function resize() {
  const w = canvas.clientWidth || innerWidth;
  const h = canvas.clientHeight || innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / Math.max(h, 1);
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize, { passive: true });
resize();

function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
function smootherstep(t) {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
}
function seg(u, a, b) {
  return smootherstep((u - a) / Math.max(1e-6, b - a));
}
function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

const camKnots = [
  new THREE.Vector3(4.0, 1.4, 4.4),
  new THREE.Vector3(-3.35, 1.2, 1.55),
  new THREE.Vector3(-1.45, 1.08, 0.55),
  new THREE.Vector3(0.0, 1.35, 3.55),
  new THREE.Vector3(0.3, 3.15, 1.55),
];
const lookKnots = [
  new THREE.Vector3(0.0, 0.55, 0.1),
  new THREE.Vector3(-0.5, 0.62, 0.05),
  new THREE.Vector3(0.15, 0.7, 0.05),
  new THREE.Vector3(0.0, 0.6, 1.05),
  new THREE.Vector3(0.0, 0.48, 1.2),
];

/* Bake path to LUTs — zero alloc in hot loop */
const camLUT = new Float32Array(PATH_SAMPLES * 3);
const lookLUT = new Float32Array(PATH_SAMPLES * 3);
(function bake() {
  for (let i = 0; i < PATH_SAMPLES; i++) {
    const u = i / (PATH_SAMPLES - 1);
    const n = camKnots.length - 1;
    const x = u * n;
    const i0 = Math.floor(x);
    const t = x - i0;
    const a = Math.max(0, i0 - 1), b = i0, c = Math.min(n, i0 + 1), d = Math.min(n, i0 + 2);
    const o = i * 3;
    camLUT[o]     = catmull(camKnots[a].x, camKnots[b].x, camKnots[c].x, camKnots[d].x, t);
    camLUT[o + 1] = catmull(camKnots[a].y, camKnots[b].y, camKnots[c].y, camKnots[d].y, t);
    camLUT[o + 2] = catmull(camKnots[a].z, camKnots[b].z, camKnots[c].z, camKnots[d].z, t);
    lookLUT[o]     = catmull(lookKnots[a].x, lookKnots[b].x, lookKnots[c].x, lookKnots[d].x, t);
    lookLUT[o + 1] = catmull(lookKnots[a].y, lookKnots[b].y, lookKnots[c].y, lookKnots[d].y, t);
    lookLUT[o + 2] = catmull(lookKnots[a].z, lookKnots[b].z, lookKnots[c].z, lookKnots[d].z, t);
  }
})();

const _cam = new THREE.Vector3();
const _look = new THREE.Vector3();
function sampleLUT(lut, u, out) {
  const max = PATH_SAMPLES - 1;
  const x = clamp01(u) * max;
  const i = x | 0;
  const f = x - i;
  const i2 = i < max ? i + 1 : i;
  const a = i * 3, b = i2 * 3;
  out.x = lut[a] + (lut[b] - lut[a]) * f;
  out.y = lut[a + 1] + (lut[b + 1] - lut[a + 1]) * f;
  out.z = lut[a + 2] + (lut[b + 2] - lut[a + 2]) * f;
  return out;
}

/* --- Scroll: read once per frame, light damp at fixed 60Hz --- */
let targetT = 0;
let scrollT = 0;
let ready = false;
let idleSpin = 0;
let lastLabel = -1;

function maxScroll() {
  return Math.max(1, document.documentElement.scrollHeight - innerHeight);
}
function readTarget() {
  return clamp01(scrollY / maxScroll());
}
targetT = readTarget();

function fitObject(root) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = 3.55 / Math.max(size.x, size.y, size.z);
  root.position.sub(center);
  root.scale.setScalar(scale);
  root.updateMatrixWorld(true);
  const box2 = new THREE.Box3().setFromObject(root);
  root.position.y -= box2.min.y;
  root.updateMatrixWorld(true);
}

function makePivot(parent, name, hingeWorld) {
  const pivot = new THREE.Group();
  pivot.name = name;
  parent.add(pivot);
  const local = hingeWorld.clone();
  parent.worldToLocal(local);
  pivot.position.copy(local);
  return pivot;
}

function rigAnimatableParts(root) {
  root.updateMatrixWorld(true);
  // Marker pivots (camera-led “doors” / access beats — do NOT spatially split meshes)
  makePivot(root, "DoorLPivot", new THREE.Vector3(-0.68, 0.55, 0.52));
  makePivot(root, "DoorRPivot", new THREE.Vector3(0.68, 0.55, 0.52));
  const openPivot = makePivot(root, OPEN_PART_PIVOT, new THREE.Vector3(0, 0.62, 0.78));
  if (OPEN_PART_PATTERN) {
    const re = new RegExp(OPEN_PART_PATTERN, "i");
    const attach = [];
    root.traverse((o) => {
      if (re.test(o.name)) attach.push(o);
    });
    attach.forEach((n) => openPivot.attach(n));
  }
  rig.openPart = openPivot;
}

function toStandard(m) {
  if (!m) return m;
  if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
  if (m.isMeshStandardMaterial && !m.isMeshPhysicalMaterial) {
    m.envMapIntensity = 0;
    m.toneMapped = false;
    return m;
  }
  const std = new THREE.MeshStandardMaterial({
    color: m.color ? m.color.clone() : 0xffffff,
    map: m.map || null,
    metalness: m.metalness ?? 0.4,
    roughness: Math.min(1, (m.roughness ?? 0.5) + 0.1),
    normalMap: m.normalMap || null,
    roughnessMap: m.roughnessMap || null,
    metalnessMap: m.metalnessMap || null,
    emissive: m.emissive ? m.emissive.clone() : 0x000000,
    emissiveMap: m.emissiveMap || null,
    emissiveIntensity: m.emissiveIntensity ?? 1,
    transparent: !!m.transparent,
    opacity: m.opacity ?? 1,
    side: m.side ?? THREE.FrontSide,
    toneMapped: false,
  });
  std.envMapIntensity = 0;
  return std;
}

function cheapifyMaterials(root) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = false;
    o.receiveShadow = false;
    o.frustumCulled = true;
    if (Array.isArray(o.material)) o.material = o.material.map(toStandard);
    else o.material = toStandard(o.material);
  });
}

async function loadFirst(urls) {
  const loader = new GLTFLoader();
  let lastErr = null;
  for (const url of urls) {
    try {
      const gltf = await new Promise((resolve, reject) => {
        loader.load(url, resolve, (e) => {
          if (e.total) progEl.style.width = ((e.loaded / e.total) * 100) + "%";
        }, reject);
      });
      return gltf;
    } catch (err) { lastErr = err; }
  }
  throw lastErr || new Error("model_load_failed");
}

try {
  const gltf = await loadFirst(URLS);
  fitObject(gltf.scene);
  objectRoot.add(gltf.scene);
  rigAnimatableParts(objectRoot); // open-part pivot only — never strip body meshes
  cheapifyMaterials(objectRoot);
  ready = true;
  progEl.style.width = "100%";
  loadEl.dataset.done = "1";
} catch (e) {
  console.error(e);
  loadEl.style.display = "none";
  errEl.style.display = "block";
  errEl.textContent = "No se pudo cargar el modelo 3D.";
}

/* Hot loop — frame-rate-independent follow, zero alloc */
let last = performance.now();
let frames = 0;
let fpsT = 0;

function animate(now) {
  const rawDt = Math.min(0.05, (now - last) / 1000);
  last = now;

  // Always track live scroll (cheap). Snappy exp damp kills “a golpes” lag.
  targetT = readTarget();
  scrollT += (targetT - scrollT) * (1 - Math.exp(-24 * rawDt));

  if (ready) {
    if (scrollT < 0.03) {
      idleSpin += rawDt * 0.1;
      objectRoot.rotation.y = idleSpin * (1 - seg(scrollT, 0, 0.06));
    } else {
      objectRoot.rotation.y += (0 - objectRoot.rotation.y) * (1 - Math.exp(-10 * rawDt));
    }
    const openAmt = seg(scrollT, 0.72, 0.92);
    if (rig.openPart) rig.openPart.rotation.x = -openAmt * 0.9;
    accentLight.intensity = openAmt * 1.8;
  }

  const u = clamp01(scrollT);
  sampleLUT(camLUT, u, _cam);
  sampleLUT(lookLUT, u, _look);
  camera.position.copy(_cam);
  camera.lookAt(_look);

  const idx = Math.min(BEATS.length - 1, (u * BEATS.length) | 0);
  if (idx !== lastLabel) {
    lastLabel = idx;
    setBeat(idx);
  }

  renderer.render(scene, camera);
  frames++;
  fpsT += rawDt;
  if (fpsT >= 1) {
    window.${fpsGlobal} = frames;
    window.${callsGlobal} = renderer.info.render.calls;
    frames = 0;
    fpsT = 0;
    renderer.info.reset();
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
</script>
</body>
</html>`;
}
