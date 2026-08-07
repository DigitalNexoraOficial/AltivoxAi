/**
 * Mustang landing with Sketchfab embed (when the mesh is view-only / not downloadable).
 * Model: Ford Mustang Fastback 1967 by ZIRODESIGN.
 */

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const SKETCHFAB = {
  uid: "8949a90f004848e9b26c16819ece43ae",
  title: "Ford Mustang Fastback 1967",
  author: "ZIRODESIGN",
  authorUrl: "https://sketchfab.com/zirodesign",
  modelUrl:
    "https://sketchfab.com/3d-models/ford-mustang-fastback-1967-8949a90f004848e9b26c16819ece43ae",
  embedSrc:
    "https://sketchfab.com/models/8949a90f004848e9b26c16819ece43ae/embed?ui_theme=dark&autostart=1&ui_infos=0&ui_watermark_link=0&ui_settings=0&dnt=1",
} as const;

/**
 * Full-bleed Sketchfab Mustang + scroll narrative.
 * Sketchfab does not allow downloading this mesh; embed is the only legal integration.
 */
export function buildMustangPhotoLandingHtml(input: {
  clientName: string;
  carTitle: string;
}): string {
  const brand = escapeHtml(input.clientName || "Altivox");
  const carTitle = escapeHtml(SKETCHFAB.title);
  const author = escapeHtml(SKETCHFAB.author);

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
    background: #050507;
  }
  .stage iframe {
    position: absolute; inset: 0;
    width: 100%; height: 100%; border: 0;
  }
  .stage-veil {
    position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background:
      linear-gradient(180deg, rgba(5,5,7,.55) 0%, transparent 28%, transparent 62%, rgba(5,5,7,.82) 100%),
      linear-gradient(90deg, rgba(5,5,7,.5) 0%, transparent 35%);
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
  .credit a { color: #1CAAD9; }
  @media (max-width: 720px) {
    .hint { justify-self: start; }
  }
</style>
</head>
<body>
  <section class="stage" aria-label="Modelo 3D ${carTitle}">
    <iframe
      title="${carTitle}"
      src="${SKETCHFAB.embedSrc}"
      allow="autoplay; fullscreen; xr-spatial-tracking"
      allowfullscreen
      loading="eager"
    ></iframe>
    <div class="stage-veil" aria-hidden="true"></div>
    <div class="hud">
      <div>
        <div class="brand">${brand}</div>
        <div class="hero-copy" style="margin-top:18px">
          <div class="kicker">Modelo 3D · Sketchfab</div>
          <h1>${carTitle}</h1>
          <p>Explora el coche en 3D: arrastra para orbitar, scroll o pellizca para zoom.</p>
        </div>
      </div>
      <div class="hint">Interactúa · <span>Orbit / Zoom</span></div>
    </div>
  </section>

  <main class="story">
    <article class="beat">
      <div class="n">01 · Presentación</div>
      <h2>${carTitle}</h2>
      <p>Silueta fastback clásica. El modelo 3D de alta densidad vive en el visor superior: gíralo y examina carrocería, faros y líneas de techo.</p>
    </article>
    <article class="beat">
      <div class="n">02 · Acceso</div>
      <h2>Puertas y acceso</h2>
      <p>Acércate a los laterales en el visor para apreciar paneles, manillas y proporciones del habitáculo. (El autor no permite descargar el mesh; la interacción es la del visor Sketchfab.)</p>
    </article>
    <article class="beat">
      <div class="n">03 · Interior</div>
      <h2>Habitáculo</h2>
      <p>Entra con zoom hacia la cabina: asientos, salpicadero y detalles modelados en el archivo original de ${author}.</p>
    </article>
    <article class="beat">
      <div class="n">04 · Frontal</div>
      <h2>Luna y morro</h2>
      <p>Orienta la cámara al frontal: parabrisas, parrilla y óptica del Mustang Fastback.</p>
    </article>
    <article class="beat">
      <div class="n">05 · Capó</div>
      <h2>Capó y vano</h2>
      <p>Desplázate sobre el capó en el visor para la vista superior del morro. Para animaciones propias (apertura de puertas/capó) haría falta un GLB descargable con licencia.</p>
    </article>
    <p class="credit">
      <a href="${SKETCHFAB.modelUrl}" target="_blank" rel="noopener noreferrer">${carTitle}</a>
      by <a href="${SKETCHFAB.authorUrl}" target="_blank" rel="noopener noreferrer">${author}</a>
      on <a href="https://sketchfab.com" target="_blank" rel="noopener noreferrer">Sketchfab</a>
      · embed oficial (modelo no descargable)
    </p>
  </main>
<script>
(function () {
  // Soft reveal for story beats
  var beats = document.querySelectorAll(".beat");
  if (!("IntersectionObserver" in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.style.opacity = "1";
      e.target.style.transform = "translateY(0)";
    });
  }, { threshold: 0.2 });
  beats.forEach(function (el) {
    el.style.opacity = "0";
    el.style.transform = "translateY(18px)";
    el.style.transition = "opacity .6s ease, transform .6s ease";
    io.observe(el);
  });
})();
</script>
</body>
</html>`;
}
