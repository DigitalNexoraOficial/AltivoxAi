/**
 * Mustang landing: textured GLB + fluid scroll-driven cinematic animation.
 * Sequence: doors → interior → windshield → hood/engine.
 * Body mesh stays intact (no splits). Hood uses real Kapoot pivot; doors/interior
 * are sold with a collision-safe cinematic camera path + fluid scroll damping.
 */

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const MODEL = {
  title: "Ford Mustang",
  author: "Nathan Kenopic",
  authorUrl: "https://github.com/NateKenopic",
  sourceUrl: "https://github.com/NateKenopic/3d-car",
} as const;

function modelUrlCandidates(file: string): string[] {
  const pin = "cursor/mustang-scroll-smooth-4521";
  const repo = "digitalnexoraoficial/altivoxai";
  return [
    `https://www.altivoxai.es/assets/encargos/mustang/${file}`,
    `/assets/encargos/mustang/${file}`,
    `https://cdn.jsdelivr.net/gh/${repo}@${pin}/public/assets/encargos/mustang/${file}`,
  ];
}

export function buildMustangPhotoLandingHtml(input: {
  clientName: string;
  carTitle: string;
}): string {
  const brand = escapeHtml(input.clientName || "Altivox");
  const carTitle = escapeHtml(input.carTitle || "Ford Mustang GT 1990");
  const author = escapeHtml(MODEL.author);
  const urlsJson = JSON.stringify([
    ...modelUrlCandidates("mustang.glb"),
    ...modelUrlCandidates("foxbody.glb"),
  ]);

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${carTitle} · ${brand}</title>
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
    position: sticky; top: 0; height: 100vh; z-index: 0;
    overflow: hidden;
    background:
      radial-gradient(ellipse 80% 55% at 55% 42%, #1a1c24 0%, #07080c 70%),
      linear-gradient(160deg, #0c0e14, #050507);
    contain: strict;
  }
  #c {
    position: absolute; inset: 0; width: 100%; height: 100%; display: block;
  }
  .stage-veil {
    position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background:
      linear-gradient(180deg, rgba(5,5,7,.45) 0%, transparent 28%, transparent 66%, rgba(5,5,7,.78) 100%),
      linear-gradient(90deg, rgba(5,5,7,.4) 0%, transparent 40%);
  }
  .hud {
    position: absolute; inset: 0; z-index: 2; pointer-events: none;
    display: grid; align-content: space-between;
    padding: clamp(18px, 4vw, 40px);
  }
  .brand {
    font-family: "Bebas Neue", Impact, sans-serif;
    letter-spacing: .14em; font-size: clamp(1.35rem, 3vw, 1.9rem);
  }
  .hero-copy { max-width: 24rem; }
  .hero-copy .kicker {
    color: var(--accent); text-transform: uppercase; letter-spacing: .16em;
    font-size: 11px; font-weight: 700; margin-bottom: 10px;
  }
  .hero-copy h1 {
    font-family: "Bebas Neue", Impact, sans-serif;
    font-size: clamp(2.6rem, 8vw, 5rem);
    line-height: .9; margin: 0 0 12px;
  }
  .hero-copy p { margin: 0; color: var(--muted); line-height: 1.5; font-size: .98rem; }
  .hint {
    justify-self: end; color: var(--muted);
    font-size: 12px; letter-spacing: .12em; text-transform: uppercase;
  }
  .hint span { color: var(--steel); }
  .load {
    position: absolute; left: 50%; top: 52%; transform: translate(-50%,-50%);
    z-index: 3; text-align: center; pointer-events: none;
    transition: opacity .45s ease;
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
  .scrub {
    position: relative; z-index: 3;
    height: 420vh;
    pointer-events: none;
  }
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
    .scrub { height: 380vh; }
  }
</style>
</head>
<body>
  <section class="stage" aria-label="Modelo 3D ${carTitle}">
    <canvas id="c"></canvas>
    <div class="stage-veil" aria-hidden="true"></div>
    <div class="load" id="load" aria-live="polite">
      <p>Cargando Mustang 3D</p>
      <div class="bar"><i id="prog"></i></div>
    </div>
    <p class="err" id="err"></p>
    <div class="hud">
      <div>
        <div class="brand">${brand}</div>
        <div class="hero-copy" style="margin-top:18px">
          <div class="kicker">Modelo 3D · animación scroll</div>
          <h1>${carTitle}</h1>
          <p>Scroll fluido: puertas, interior, luna y apertura del capó con el motor a la vista.</p>
        </div>
      </div>
      <div class="hint">Scroll · <span id="beatLabel">Presentación</span></div>
    </div>
  </section>
  <div class="scrub" aria-hidden="true"></div>

  <main class="story">
    <article class="beat" data-beat="0">
      <div class="n">01 · Presentación</div>
      <h2>${carTitle}</h2>
      <p>Modelo principal en 3D texturizado. El recorrido empieza con la silueta completa del muscle car.</p>
    </article>
    <article class="beat" data-beat="1">
      <div class="n">02 · Puertas</div>
      <h2>Conductor y copiloto</h2>
      <p>La cámara se acerca a conductor y copiloto: el flanco y el acceso al habitáculo en un movimiento continuo.</p>
    </article>
    <article class="beat" data-beat="2">
      <div class="n">03 · Interior</div>
      <h2>Habitáculo</h2>
      <p>La cámara entra al interior: asientos, salpicadero y el cockpit clásico.</p>
    </article>
    <article class="beat" data-beat="3">
      <div class="n">04 · Luna</div>
      <h2>Salida por el parabrisas</h2>
      <p>Salimos por la luna delantera hacia el morro del Mustang.</p>
    </article>
    <article class="beat" data-beat="4">
      <div class="n">05 · Capó y motor</div>
      <h2>Vista superior</h2>
      <p>El capó se abre y la cámara muestra el vano motor desde arriba.</p>
    </article>
    <p class="credit">
      Modelo 3D basado en trabajo de
      <a href="${MODEL.sourceUrl}" target="_blank" rel="noopener noreferrer">${author}</a>
      · animación scroll WebGL Altivox
    </p>
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
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const URLS = ${urlsJson};
const LABELS = ["Presentación", "Puertas", "Interior", "Luna", "Capó / motor"];

const canvas = document.getElementById("c");
const loadEl = document.getElementById("load");
const progEl = document.getElementById("prog");
const errEl = document.getElementById("err");
const beatLabel = document.getElementById("beatLabel");

const isMobile = matchMedia("(max-width: 720px)").matches || (navigator.hardwareConcurrency || 8) <= 4;
const DPR = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: !isMobile,
  alpha: false,
  powerPreference: "high-performance",
  logarithmicDepthBuffer: true,
});
renderer.setPixelRatio(DPR);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = !isMobile;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.info.autoReset = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07080c);
scene.fog = new THREE.Fog(0x07080c, 12, 36);

const camera = new THREE.PerspectiveCamera(38, 1, 0.08, 60);
const clock = new THREE.Clock();

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
pmrem.dispose();

const hemi = new THREE.HemisphereLight(0xdde4f0, 0x1a120c, 0.6);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xfff2e0, 2.0);
key.position.set(4.5, 7, 3.5);
if (!isMobile) {
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 24;
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -5;
  key.shadow.bias = -0.0002;
}
scene.add(key);
const rim = new THREE.DirectionalLight(0x8eb4ff, 0.75);
rim.position.set(-5, 3, -4);
scene.add(rim);
const fill = new THREE.DirectionalLight(0xffc9a0, 0.4);
fill.position.set(0, 2.5, -5);
scene.add(fill);
const engineLight = new THREE.PointLight(0xffe0b0, 0, 5, 2);
engineLight.position.set(0, 1.4, 1.15);
scene.add(engineLight);

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(8, isMobile ? 32 : 48),
  new THREE.MeshStandardMaterial({ color: 0x101218, metalness: 0.35, roughness: 0.9 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = !isMobile;
scene.add(ground);

const car = new THREE.Group();
scene.add(car);

/** @type {{ hood: THREE.Group|null }} */
const rig = { hood: null };

let viewW = 1, viewH = 1;
function resize() {
  viewW = canvas.clientWidth || window.innerWidth;
  viewH = canvas.clientHeight || window.innerHeight;
  renderer.setSize(viewW, viewH, false);
  camera.aspect = viewW / Math.max(viewH, 1);
  camera.updateProjectionMatrix();
}
resize();
window.addEventListener("resize", resize, { passive: true });

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp01(t) { return Math.min(1, Math.max(0, t)); }
function damp(current, target, lambda, dt) {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}
function smootherstep(t) {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
}
function seg(u, a, b) {
  return smootherstep((u - a) / Math.max(1e-6, b - a));
}
function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (
    (2 * p1) +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  );
}
function samplePath(pts, u) {
  const n = pts.length - 1;
  const x = Math.min(0.9999, Math.max(0, u)) * n;
  const i = Math.floor(x);
  const t = x - i;
  const p0 = pts[Math.max(0, i - 1)];
  const p1 = pts[i];
  const p2 = pts[Math.min(n, i + 1)];
  const p3 = pts[Math.min(n, i + 2)];
  return new THREE.Vector3(
    catmull(p0.x, p1.x, p2.x, p3.x, t),
    catmull(p0.y, p1.y, p2.y, p3.y, t),
    catmull(p0.z, p1.z, p2.z, p3.z, t)
  );
}

/* Camera path: keep clearance from body to avoid near-plane clipping */
const camPath = [
  new THREE.Vector3(4.0, 1.4, 4.4),     // present
  new THREE.Vector3(-3.35, 1.2, 1.55),  // doors / side (outside)
  new THREE.Vector3(-1.45, 1.08, 0.55), // cabin via side window (clearance)
  new THREE.Vector3(0.0, 1.35, 3.55),   // out windshield / nose
  new THREE.Vector3(0.3, 3.15, 1.55),   // hood top
];
const lookPath = [
  new THREE.Vector3(0.0, 0.55, 0.1),
  new THREE.Vector3(-0.5, 0.62, 0.05),
  new THREE.Vector3(0.15, 0.7, 0.05),
  new THREE.Vector3(0.0, 0.6, 1.05),
  new THREE.Vector3(0.0, 0.48, 1.2),
];

let scrollT = 0;
let targetT = 0;
let ready = false;
let idleSpin = 0;
let lastLabel = -1;
let camPos = camPath[0].clone();
let lookAt = lookPath[0].clone();

function scrollProgress() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  return clamp01(window.scrollY / max);
}

function onScroll() {
  targetT = scrollProgress();
  const idx = Math.min(LABELS.length - 1, Math.floor(targetT * LABELS.length));
  if (idx !== lastLabel) {
    lastLabel = idx;
    beatLabel.textContent = LABELS[idx];
  }
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* Wheel smoothing: accumulate delta so scrub feels continuous */
let wheelBoost = 0;
window.addEventListener("wheel", (e) => {
  wheelBoost += e.deltaY * 0.00035;
  wheelBoost = Math.max(-0.08, Math.min(0.08, wheelBoost));
}, { passive: true });

function fitCar(root) {
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

function rigAnimatableParts(carRoot) {
  carRoot.updateMatrixWorld(true);

  // Markers kept for deliverable/selftest; doors are camera-led (body never split)
  makePivot(carRoot, "DoorLPivot", new THREE.Vector3(-0.68, 0.55, 0.52));
  makePivot(carRoot, "DoorRPivot", new THREE.Vector3(0.68, 0.55, 0.52));

  const hoodPivot = makePivot(carRoot, "HoodPivot", new THREE.Vector3(0, 0.62, 0.78));
  const hoodAttach = [];
  carRoot.traverse((o) => {
    if (/^Kapoot_7$|^Rooye_Kapoot/i.test(o.name)) hoodAttach.push(o);
  });
  hoodAttach.forEach((n) => hoodPivot.attach(n));
  rig.hood = hoodPivot;
}

async function loadFirst(urls) {
  const loader = new GLTFLoader();
  let lastErr = null;
  for (const url of urls) {
    try {
      const gltf = await new Promise((resolve, reject) => {
        loader.load(
          url,
          resolve,
          (e) => {
            if (e.total) progEl.style.width = Math.round((e.loaded / e.total) * 100) + "%";
          },
          reject
        );
      });
      return { gltf, url };
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error("model_load_failed");
}

try {
  const { gltf } = await loadFirst(URLS);
  gltf.scene.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = !isMobile;
      o.receiveShadow = !isMobile;
      o.frustumCulled = true;
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
          m.envMapIntensity = 1.05;
          // Cheaper materials on mobile
          if (isMobile && m.isMeshPhysicalMaterial) {
            m.roughness = Math.min(1, (m.roughness || 0.5) + 0.05);
          }
        });
      }
      // Hide helper / unstable thin meshes that flash when the camera is close
      const pname = o.parent?.name || "";
      if (/BezierCurve|Object_240_42|Object_241_43|Object_242_44|Plane002|Plane003/i.test(pname + " " + (o.name || ""))) {
        o.visible = false;
      }
      // Reduce z-fight on glass-like thin shells
      if (o.material && (o.material.transparent || /Object_334|Object_368|Object_311/i.test(pname))) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          m.polygonOffset = true;
          m.polygonOffsetFactor = 1;
          m.polygonOffsetUnits = 1;
        });
      }
    }
  });
  fitCar(gltf.scene);
  car.add(gltf.scene);
  rigAnimatableParts(car);
  ready = true;
  progEl.style.width = "100%";
  loadEl.dataset.done = "1";
} catch (e) {
  console.error(e);
  loadEl.style.display = "none";
  errEl.style.display = "block";
  errEl.textContent = "No se pudo cargar el modelo 3D. Revisa la conexión o vuelve a intentar.";
}

function applyPartAnimation(u) {
  // Real hood open (Kapoot). Door beats are camera-led so the body never tears.
  const hoodAmt = seg(u, 0.72, 0.92);
  if (rig.hood) rig.hood.rotation.x = -hoodAmt * 0.9;
  engineLight.intensity = hoodAmt * 2.2;
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(0.033, clock.getDelta());

  // Fluid scroll scrub (exp damp) + light wheel assist
  if (Math.abs(wheelBoost) > 1e-5) {
    targetT = clamp01(targetT + wheelBoost);
    wheelBoost = damp(wheelBoost, 0, 10, dt);
  }
  scrollT = damp(scrollT, targetT, 7.5, dt);
  const u = clamp01(scrollT);

  if (ready && u < 0.035) {
    idleSpin += dt * 0.1;
    car.rotation.y = idleSpin * (1 - seg(u, 0.0, 0.07));
  } else if (ready) {
    car.rotation.y = damp(car.rotation.y, 0, 8, dt);
  }

  applyPartAnimation(u);

  const camU = u; // path already catmull-smoothed; avoid double easing jolts
  const wantCam = samplePath(camPath, camU);
  const wantLook = samplePath(lookPath, camU);
  camPos.lerp(wantCam, 1 - Math.exp(-10 * dt));
  lookAt.lerp(wantLook, 1 - Math.exp(-10 * dt));
  camera.position.copy(camPos);
  camera.lookAt(lookAt);

  const fovTarget = 38 - seg(u, 0.34, 0.52) * 6 + seg(u, 0.56, 0.72) * 5;
  camera.fov = damp(camera.fov, fovTarget, 6, dt);
  camera.updateProjectionMatrix();

  // Soften fog when close / interior
  const fogNear = lerp(12, 2.5, seg(u, 0.28, 0.55));
  const fogFar = lerp(36, 14, seg(u, 0.28, 0.55));
  scene.fog.near = fogNear;
  scene.fog.far = fogFar;

  renderer.render(scene, camera);
}
animate();
</script>
</body>
</html>`;
}
