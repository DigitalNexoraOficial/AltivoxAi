/**
 * Photo-based Fox-body Mustang GT 1990 scroll landing.
 * Uses Wikimedia Commons photos of real 1987–1993 Mustangs as 3D textures
 * (same-origin copies under /assets/encargos/mustang when deployed).
 */

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Stable Wikimedia thumbs (no tracking params). */
const WIKI = {
  side: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/%2787-%2790_Ford_Mustang_Coupe.JPG/960px-%2787-%2790_Ford_Mustang_Coupe.JPG",
  hero: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Ford_Mustang_GT_%281990%29_%2852450755676%29.jpg/960px-Ford_Mustang_GT_%281990%29_%2852450755676%29.jpg",
  hero2: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Ford_Mustang_GT_%281990%29_%2852451276363%29.jpg/960px-Ford_Mustang_GT_%281990%29_%2852451276363%29.jpg",
  fox: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Ford_Fox_Body_Mustang.jpg/960px-Ford_Fox_Body_Mustang.jpg",
} as const;

const LOCAL = {
  side: "/assets/encargos/mustang/side.jpg",
  hero: "/assets/encargos/mustang/hero.jpg",
  hero2: "/assets/encargos/mustang/hero2.jpg",
  fox: "/assets/encargos/mustang/fox.jpg",
} as const;

export function buildMustangPhotoLandingHtml(input: {
  clientName: string;
  carTitle: string;
}): string {
  const brand = escapeHtml(input.clientName || "Altivox");
  const carTitle = escapeHtml(input.carTitle || "Ford Mustang GT 1990");
  const wikiJson = JSON.stringify(WIKI);
  const localJson = JSON.stringify(LOCAL);

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
  body {
    margin: 0; color: var(--text);
    font-family: "DM Sans", system-ui, sans-serif;
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
    font-family: "Bebas Neue", Impact, sans-serif;
    letter-spacing: .14em; font-size: clamp(1.4rem, 3vw, 2rem);
  }
  .progress {
    width: min(180px, 36vw); height: 2px; background: rgba(243,240,234,.15);
    margin-top: 12px; overflow: hidden;
  }
  .progress > i {
    display: block; height: 100%; width: 0%; background: var(--accent);
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
    font-family: "Bebas Neue", Impact, sans-serif;
    font-size: clamp(2.4rem, 7vw, 4.8rem);
    line-height: .92; margin: 0 0 12px; letter-spacing: .02em;
  }
  .copy p { margin: 0; color: var(--muted); line-height: 1.55; font-size: 0.98rem; }
  .hint {
    justify-self: end; align-self: end;
    color: var(--muted); font-size: 12px; letter-spacing: .12em; text-transform: uppercase;
  }
  .hint span { color: var(--steel); }
  .credit {
    position: fixed; left: clamp(18px, 4vw, 40px); bottom: clamp(18px, 4vw, 40px);
    z-index: 2; pointer-events: none;
    font-size: 10px; color: rgba(154,149,140,.75); max-width: 16rem; line-height: 1.35;
  }
  @media (max-width: 720px) {
    .top { flex-direction: column; }
    .hint { justify-self: start; margin-bottom: 36px; }
  }
</style>
</head>
<body>
  <div id="stage" aria-hidden="true">
    <div id="stage-msg">Cargando fotos reales del Mustang GT 1990…</div>
  </div>
  <div class="scroll-track" aria-hidden="true"></div>
  <div class="hud">
    <div class="top">
      <div>
        <div class="brand">${brand}</div>
        <div class="progress" aria-hidden="true"><i id="bar"></i></div>
      </div>
      <div class="copy" id="copy">
        <div class="kicker" id="kicker">Fox-body · foto 3D</div>
        <h1 id="headline">${carTitle}</h1>
        <p id="sub">Modelo 3D texturizado con fotografías reales del Mustang GT 1990. Desplaza para el recorrido cinematográfico.</p>
      </div>
    </div>
    <div class="hint">Desplaza · <span id="beat">Exterior</span></div>
  </div>
  <p class="credit">Fotos: Wikimedia Commons — Ford Mustang GT (1990) / Fox-body 1987–1993</p>
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script>
(function () {
  var msg = document.getElementById("stage-msg");
  function fail(text) {
    if (msg) { msg.hidden = false; msg.textContent = text; }
  }
  if (!window.THREE) {
    fail("No se pudo cargar Three.js.");
    return;
  }

  var WIKI = ${wikiJson};
  var LOCAL = ${localJson};
  var TITLE = ${JSON.stringify(input.carTitle || "Ford Mustang GT 1990")};

  var scenes = [
    { k: "01 · Presentación", h: TITLE, s: "Mustang GT 1990 real (Fox-body) en escena 3D. Gira y observa la carrocería.", beat: "Exterior" },
    { k: "02 · Acceso", h: "Puertas abiertas", s: "Las puertas se abren al ritmo del scroll.", beat: "Puertas" },
    { k: "03 · Cabina", h: "Interior", s: "Entra al habitáculo del Fox-body.", beat: "Interior" },
    { k: "04 · Luna", h: "Salida frontal", s: "La cámara atraviesa el parabrisas.", beat: "Luna" },
    { k: "05 · Motor", h: "Capó y motor", s: "El capó se abre; vista superior del vano motor.", beat: "Motor" }
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
  } catch (e) {
    fail("WebGL no disponible.");
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (renderer.outputColorSpace !== undefined) renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(4.8, 1.8, 6.2);

  scene.add(new THREE.HemisphereLight(0xf5efe6, 0x1a120c, 1.05));
  var key = new THREE.DirectionalLight(0xffffff, 1.55);
  key.position.set(5, 8, 4);
  scene.add(key);
  var rim = new THREE.DirectionalLight(0xc45c26, 0.55);
  rim.position.set(-6, 3, -3);
  scene.add(rim);

  var floor = new THREE.Mesh(
    new THREE.CircleGeometry(20, 64),
    new THREE.MeshStandardMaterial({ color: 0x101218, metalness: 0.3, roughness: 0.85 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.55;
  scene.add(floor);

  var car = new THREE.Group();
  scene.add(car);

  var dark = new THREE.MeshStandardMaterial({ color: 0x111318, metalness: 0.55, roughness: 0.4 });
  var chrome = new THREE.MeshStandardMaterial({ color: 0xc9d0db, metalness: 1, roughness: 0.18 });
  var glass = new THREE.MeshStandardMaterial({
    color: 0x8ed0ea, metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.28
  });
  var leather = new THREE.MeshStandardMaterial({ color: 0x2a211c, roughness: 0.85, metalness: 0.05 });
  var engineMat = new THREE.MeshStandardMaterial({ color: 0x2f343c, metalness: 0.88, roughness: 0.32 });
  var paint = new THREE.MeshStandardMaterial({ color: 0x7a1014, metalness: 0.7, roughness: 0.3 });

  function box(w, h, d, mat, x, y, z) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x || 0, y || 0, z || 0);
    return m;
  }

  function loadTex(localUrl, wikiUrl) {
    return new Promise(function (resolve) {
      var loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");
      function ok(tex) {
        if (tex.colorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        resolve(tex);
      }
      loader.load(
        localUrl,
        ok,
        undefined,
        function () {
          loader.load(wikiUrl, ok, undefined, function () { resolve(null); });
        }
      );
    });
  }

  function matFromTex(tex, fallback) {
    if (!tex) return fallback;
    return new THREE.MeshStandardMaterial({
      map: tex,
      metalness: 0.35,
      roughness: 0.45
    });
  }

  Promise.all([
    loadTex(LOCAL.side, WIKI.side),
    loadTex(LOCAL.hero, WIKI.hero),
    loadTex(LOCAL.hero2, WIKI.hero2),
    loadTex(LOCAL.fox, WIKI.fox)
  ]).then(function (texs) {
    var sideTex = texs[0];
    var heroTex = texs[1];
    var hero2Tex = texs[2];
    var foxTex = texs[3];
    if (!sideTex && !heroTex && !foxTex) {
      fail("No se pudieron cargar las fotos del Mustang. Revisa la red o abre en pestaña.");
      return;
    }
    if (msg) msg.hidden = true;

    var sideMat = matFromTex(sideTex, paint);
    var sideMatFlip = matFromTex(sideTex ? sideTex.clone() : null, paint);
    if (sideMatFlip.map) {
      sideMatFlip.map.wrapS = THREE.RepeatWrapping;
      sideMatFlip.map.repeat.x = -1;
      sideMatFlip.map.offset.x = 1;
      sideMatFlip.map.needsUpdate = true;
    }
    var heroMat = matFromTex(heroTex || foxTex, paint);
    var hero2Mat = matFromTex(hero2Tex || heroTex || foxTex, paint);
    var foxMat = matFromTex(foxTex || heroTex, paint);

    /* Fox-body volume with real photos on faces */
    var bodyMats = [
      heroMat,   // +x nose
      hero2Mat,  // -x rear
      paint,     // +y roof
      dark,      // -y
      sideMat,   // +z right side
      sideMatFlip // -z left side
    ];
    var body = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.78, 1.35), bodyMats);
    body.position.set(0.05, 0.12, 0);
    car.add(body);

    /* Cabin / greenhouse */
    var cabinMats = [paint, paint, paint, paint, sideMat, sideMatFlip];
    var cabin = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.52, 1.22), cabinMats);
    cabin.position.set(-0.35, 0.62, 0);
    car.add(cabin);

    var windshield = box(0.08, 0.5, 1.12, glass, 0.35, 0.68, 0);
    windshield.rotation.z = -0.4;
    car.add(windshield);

    /* Photo billboard accent (real GT 1990) floating as reference plate */
    var plate = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 1.55),
      foxMat
    );
    plate.position.set(-0.1, 1.55, -2.4);
    plate.rotation.y = 0.15;
    car.add(plate);

    var hoodPivot = new THREE.Group();
    hoodPivot.position.set(0.55, 0.5, 0);
    var hood = new THREE.Mesh(
      new THREE.BoxGeometry(1.55, 0.06, 1.28),
      [paint, paint, heroMat, paint, paint, paint]
    );
    hood.position.set(0.75, 0, 0);
    hoodPivot.add(hood);
    car.add(hoodPivot);

    var engine = new THREE.Group();
    engine.position.set(1.15, 0.12, 0);
    engine.visible = false;
    engine.add(box(0.72, 0.34, 0.64, engineMat, 0, 0, 0));
    engine.add(box(0.55, 0.08, 0.5, chrome, 0, 0.2, 0));
    engine.add(box(0.1, 0.26, 0.1, chrome, 0.16, 0.28, 0.14));
    engine.add(box(0.1, 0.26, 0.1, chrome, -0.16, 0.28, -0.14));
    car.add(engine);

    function makeDoor(side, mat) {
      var pivot = new THREE.Group();
      pivot.position.set(-0.05, 0.25, side * 0.68);
      var panel = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.55, 0.06), mat);
      panel.position.set(0.15, 0, side * 0.02);
      pivot.add(panel);
      var win = box(0.7, 0.28, 0.04, glass, 0.05, 0.28, side * 0.02);
      pivot.add(win);
      car.add(pivot);
      return pivot;
    }
    var doorL = makeDoor(1, sideMat);
    var doorR = makeDoor(-1, sideMatFlip);

    var interior = new THREE.Group();
    interior.position.set(-0.4, 0.22, 0);
    interior.add(box(1.0, 0.08, 1.0, leather, 0, 0, 0));
    interior.add(box(0.34, 0.32, 0.36, leather, 0.05, 0.2, 0.3));
    interior.add(box(0.34, 0.32, 0.36, leather, 0.05, 0.2, -0.3));
    interior.add(box(0.08, 0.24, 0.08, chrome, 0.5, 0.24, 0.24));
    interior.add(box(0.42, 0.06, 0.4, dark, 0.42, 0.14, 0));
    car.add(interior);

    function wheel(x, z) {
      var g = new THREE.Group();
      var tire = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 24), dark);
      tire.rotation.z = Math.PI / 2;
      var rimM = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.24, 16), chrome);
      rimM.rotation.z = Math.PI / 2;
      g.add(tire); g.add(rimM);
      g.position.set(x, -0.28, z);
      car.add(g);
    }
    wheel(1.2, 0.62); wheel(1.2, -0.62); wheel(-1.15, 0.62); wheel(-1.15, -0.62);

    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function smoothstep(edge0, edge1, x) {
      var t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
      return t * t * (3 - 2 * t);
    }
    function mix(a, b, t) {
      return new THREE.Vector3(lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.z, b.z, t));
    }

    var camA = new THREE.Vector3(4.8, 1.8, 6.2);
    var camB = new THREE.Vector3(3.2, 1.5, 4.6);
    var camC = new THREE.Vector3(-0.15, 0.95, 0.1);
    var camD = new THREE.Vector3(2.8, 1.2, 0.05);
    var camE = new THREE.Vector3(1.3, 4.6, 0.2);
    var lookA = new THREE.Vector3(0.1, 0.4, 0);
    var lookB = new THREE.Vector3(0.15, 0.45, 0);
    var lookC = new THREE.Vector3(-0.25, 0.45, 0);
    var lookD = new THREE.Vector3(1.7, 0.5, 0);
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
      plate.material.opacity = 1 - smoothstep(0.25, 0.55, p);
      if (plate.material.transparent !== true) plate.material.transparent = true;

      var pos, look, idx;
      if (p < 0.18) {
        idx = 0;
        var t = p / 0.18;
        pos = mix(camA, camB, t);
        look = mix(lookA, lookB, t);
        car.rotation.y = lerp(0.55 + idleSpin, -0.08, t);
      } else if (p < 0.38) {
        idx = 1;
        var t2 = (p - 0.18) / 0.2;
        pos = mix(camB, new THREE.Vector3(2.1, 1.2, 3.5), t2);
        look = lookB;
        car.rotation.y = lerp(-0.08, 0, t2);
      } else if (p < 0.58) {
        idx = 2;
        var t3 = (p - 0.38) / 0.2;
        pos = mix(new THREE.Vector3(2.1, 1.2, 3.5), camC, t3);
        look = mix(lookB, lookC, t3);
        car.rotation.y = 0;
      } else if (p < 0.76) {
        idx = 3;
        var t4 = (p - 0.58) / 0.18;
        pos = mix(camC, camD, t4);
        look = mix(lookC, lookD, t4);
      } else {
        idx = 4;
        var t5 = clamp((p - 0.76) / 0.24, 0, 1);
        pos = mix(camD, camE, t5);
        look = mix(lookD, lookE, t5);
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
      var idle = current < 0.02 ? Math.sin((now - t0) * 0.00045) * 0.22 : 0;
      applyScroll(current, idle);
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
    applyScroll(0, 0);
    requestAnimationFrame(tick);
  });
})();
</script>
</body>
</html>`;
}
