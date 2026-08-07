/**
 * Mustang landing: real textured GLB (1965 classic) + scroll-driven Three.js camera.
 * Mesh: Nathan Kenopic / NateKenopic 3d-car (no primitive boxes).
 */

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const MODEL = {
  title: "Ford Mustang 1965",
  author: "Nathan Kenopic",
  authorUrl: "https://github.com/NateKenopic",
  sourceUrl: "https://github.com/NateKenopic/3d-car",
} as const;

/** Prefer prod/self (JPEG GLB), then CDN for Ops blob preview. */
function modelUrlCandidates(file: string): string[] {
  /** Branch pin — jsDelivr for blob:// Ops preview (no same-origin /assets). */
  const pin = "cursor/mustang-textures-prod-4521";
  const repo = "digitalnexoraoficial/altivoxai";
  return [
    `https://www.altivoxai.es/assets/encargos/mustang/${file}`,
    `/assets/encargos/mustang/${file}`,
    `https://cdn.jsdelivr.net/gh/${repo}@${pin}/public/assets/encargos/mustang/${file}`,
  ];
}

/**
 * Full-bleed WebGL Mustang + scroll narrative (doors → interior → windshield → hood).
 */
export function buildMustangPhotoLandingHtml(input: {
  clientName: string;
  carTitle: string;
}): string {
  const brand = escapeHtml(input.clientName || "Altivox");
  const carTitle = escapeHtml(input.carTitle || MODEL.title);
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
  html { scroll-behavior: smooth; }
  body {
    margin: 0; color: var(--text);
    font-family: "DM Sans", system-ui, sans-serif;
    background: var(--bg);
  }
  .stage {
    position: sticky; top: 0; height: 100vh; z-index: 0;
    overflow: hidden;
    background:
      radial-gradient(ellipse 80% 55% at 55% 42%, #1a1c24 0%, #07080c 70%),
      linear-gradient(160deg, #0c0e14, #050507);
  }
  #c {
    position: absolute; inset: 0; width: 100%; height: 100%; display: block;
  }
  .stage-veil {
    position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background:
      linear-gradient(180deg, rgba(5,5,7,.5) 0%, transparent 26%, transparent 64%, rgba(5,5,7,.78) 100%),
      linear-gradient(90deg, rgba(5,5,7,.45) 0%, transparent 38%);
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
  .hero-copy { max-width: 22rem; }
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
    transition: opacity .5s ease;
  }
  .load[data-done="1"] { opacity: 0; }
  .load .bar {
    width: min(220px, 50vw); height: 2px; margin: 14px auto 0;
    background: rgba(243,240,234,.12); overflow: hidden;
  }
  .load .bar i {
    display: block; height: 100%; width: 0%;
    background: linear-gradient(90deg, var(--accent), var(--steel));
    transition: width .25s ease;
  }
  .load p { margin: 0; color: var(--muted); font-size: 12px; letter-spacing: .14em; text-transform: uppercase; }
  .err {
    display: none; position: absolute; inset: auto 12% 18%; z-index: 4;
    text-align: center; color: #e8b4a0; font-size: 14px;
  }
  .story {
    position: relative; z-index: 3;
    background: linear-gradient(180deg, transparent, var(--bg) 48px);
    padding: 12vh 0 18vh;
  }
  .beat {
    max-width: 720px; margin: 0 auto;
    padding: clamp(48px, 10vh, 96px) clamp(18px, 4vw, 40px);
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
          <div class="kicker">Modelo 3D · WebGL</div>
          <h1>${carTitle}</h1>
          <p>Scroll para un recorrido cinematográfico: puertas, habitáculo, luna y capó.</p>
        </div>
      </div>
      <div class="hint">Scroll · <span id="beatLabel">Presentación</span></div>
    </div>
  </section>

  <main class="story">
    <article class="beat" data-beat="0">
      <div class="n">01 · Presentación</div>
      <h2>${carTitle}</h2>
      <p>Silueta clásica con mesh texturizado de alta densidad — carrocería, faros y líneas de techo reales, no primitivas.</p>
    </article>
    <article class="beat" data-beat="1">
      <div class="n">02 · Puertas</div>
      <h2>Acceso lateral</h2>
      <p>La cámara se acerca al flanco del conductor: panel, manilla y proporción del vano frente al pilar.</p>
    </article>
    <article class="beat" data-beat="2">
      <div class="n">03 · Interior</div>
      <h2>Habitáculo</h2>
      <p>Entramos hacia la cabina: asientos, salpicadero y el volumen del habitáculo clásico.</p>
    </article>
    <article class="beat" data-beat="3">
      <div class="n">04 · Luna</div>
      <h2>Parabrisas</h2>
      <p>Vista frontal a través de la luna: parrilla, óptica y el morro del Mustang.</p>
    </article>
    <article class="beat" data-beat="4">
      <div class="n">05 · Capó</div>
      <h2>Capó y vano</h2>
      <p>Plano alto sobre el capó: nervaduras, vano motor y la línea que define el muscle car.</p>
    </article>
    <p class="credit">
      Modelo 3D basado en
      <a href="${MODEL.sourceUrl}" target="_blank" rel="noopener noreferrer">${MODEL.title}</a>
      por <a href="${MODEL.authorUrl}" target="_blank" rel="noopener noreferrer">${author}</a>
      · render WebGL Altivox
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
const LABELS = ["Presentación", "Puertas", "Interior", "Luna", "Capó"];

const canvas = document.getElementById("c");
const loadEl = document.getElementById("load");
const progEl = document.getElementById("prog");
const errEl = document.getElementById("err");
const beatLabel = document.getElementById("beatLabel");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07080c);
scene.fog = new THREE.Fog(0x07080c, 8, 28);

const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 80);
const clock = new THREE.Clock();

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const hemi = new THREE.HemisphereLight(0xdde4f0, 0x1a120c, 0.55);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xfff2e0, 2.2);
key.position.set(4.5, 7, 3.5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 30;
key.shadow.camera.left = -6;
key.shadow.camera.right = 6;
key.shadow.camera.top = 6;
key.shadow.camera.bottom = -6;
scene.add(key);
const rim = new THREE.DirectionalLight(0x8eb4ff, 0.85);
rim.position.set(-5, 3, -4);
scene.add(rim);
const fill = new THREE.DirectionalLight(0xffc9a0, 0.35);
fill.position.set(0, 2, -6);
scene.add(fill);

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(9, 64),
  new THREE.MeshStandardMaterial({ color: 0x101218, metalness: 0.4, roughness: 0.85 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

const car = new THREE.Group();
scene.add(car);

function resize() {
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / Math.max(h, 1);
  camera.updateProjectionMatrix();
}
resize();
window.addEventListener("resize", resize);

function lerp(a, b, t) { return a + (b - a) * t; }
function smoothstep(t) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
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

/** Camera + lookAt keyed to scroll narrative */
const camPath = [
  new THREE.Vector3(4.6, 1.55, 5.2),   // presentation 3/4
  new THREE.Vector3(-3.8, 1.05, 1.4),  // driver door
  new THREE.Vector3(0.15, 1.05, 0.35), // interior
  new THREE.Vector3(0.0, 1.15, 5.4),   // windshield / front
  new THREE.Vector3(0.2, 3.4, 1.1),    // hood top
];
const lookPath = [
  new THREE.Vector3(0.1, 0.55, 0.2),
  new THREE.Vector3(-0.35, 0.7, 0.15),
  new THREE.Vector3(0.05, 0.85, -0.2),
  new THREE.Vector3(0.0, 0.75, 0.8),
  new THREE.Vector3(0.0, 0.55, 0.4),
];

let scrollT = 0;
let targetT = 0;
let ready = false;
let idleSpin = 0;

function scrollProgress() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  return Math.min(1, Math.max(0, window.scrollY / max));
}

window.addEventListener("scroll", () => {
  targetT = scrollProgress();
  const idx = Math.min(LABELS.length - 1, Math.floor(targetT * LABELS.length));
  beatLabel.textContent = LABELS[idx];
}, { passive: true });

function fitCar(root) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = 3.6 / Math.max(size.x, size.y, size.z);
  root.position.sub(center);
  root.scale.setScalar(scale);
  root.updateMatrixWorld(true);
  const box2 = new THREE.Box3().setFromObject(root);
  root.position.y -= box2.min.y;
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
      o.castShadow = true;
      o.receiveShadow = true;
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
          m.envMapIntensity = 1.1;
        });
      }
    }
  });
  fitCar(gltf.scene);
  car.add(gltf.scene);
  ready = true;
  progEl.style.width = "100%";
  loadEl.dataset.done = "1";
} catch (e) {
  console.error(e);
  loadEl.style.display = "none";
  errEl.style.display = "block";
  errEl.textContent = "No se pudo cargar el modelo 3D. Revisa la conexión o vuelve a intentar.";
}

const beats = document.querySelectorAll(".beat");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.style.opacity = "1";
      e.target.style.transform = "translateY(0)";
    });
  }, { threshold: 0.2 });
  beats.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(18px)";
    el.style.transition = "opacity .6s ease, transform .6s ease";
    io.observe(el);
  });
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, clock.getDelta());
  scrollT = lerp(scrollT, targetT, 1 - Math.pow(0.001, dt));
  const u = smoothstep(scrollT);

  if (ready && scrollT < 0.02) {
    idleSpin += dt * 0.15;
    car.rotation.y = idleSpin;
  } else if (ready) {
    car.rotation.y = lerp(car.rotation.y, 0, 1 - Math.pow(0.02, dt));
  }

  const camPos = samplePath(camPath, u);
  const look = samplePath(lookPath, u);
  camera.position.copy(camPos);
  camera.lookAt(look);

  renderer.render(scene, camera);
}
animate();
</script>
</body>
</html>`;
}
