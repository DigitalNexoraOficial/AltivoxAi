# Rendimiento — Web pública (escaparate)

Ámbito: **superficie 1 (web pública)**.  
`/ops` (existente · Bloque 3) tendrá presupuesto propio de rendimiento OS.  
`/r/[token]` (futuro · Bloque 6) tendrá el suyo cuando exista.  
Fase 8 del roadmap prioriza el escaparate; el OS no debe bloquearse por Three.js.

Visión: [`product-vision.md`](./product-vision.md)

---

## 1. Objetivos (propuestos)

| Métrica | Mobile | Desktop |
|---------|--------|---------|
| LCP | ≤ 2.5s | ≤ 2.0s |
| INP | ≤ 200ms | ≤ 200ms |
| CLS | ≤ 0.1 | ≤ 0.1 |
| TBT | bajo en / | bajo |
| JS landing (gzip) | presupuesto a fijar tras medición | — |

Medir con PageSpeed + CrUX reales en `www.altivoxai.es` antes de optimizar a ciegas.

---

## 2. Costes actuales identificados

### Críticos

1. **`ScrollAIScene`** (`frameloop="always"`, hasta ~140 nodos, DPR hasta 2.5) montado en home para todos los viewports.
2. **Doble motor de motion:** Framer Motion + GSAP ScrollTrigger + Lenis en la misma página.
3. **Superficie client-heavy:** casi todas las secciones `"use client"`; muchos widgets interactivos en una sola ruta.
4. **Extras fijos:** chat + sticky + sound + scroll-top + WA compiten por INP en móvil.

### Moderados

- BrandLoader / custom cursor (diferidos, pero suman).
- PNGs IG 1MB+ (fuera del LCP landing, relevantes en `/api/ig-image`).
- OG/favicon como imagen social (no LCP, sí calidad percibida).

### Mitigaciones ya presentes

- `DeferredExtras` + idle.
- `GrowthSuite` near-viewport lazy.
- Three vía `next/dynamic` `ssr: false`.
- Blur glass reducido ≤1024px en CSS.
- `prefers-reduced-motion` en varios paths.
- Adaptive DPR / PerformanceMonitor en R3F.

---

## 3. Plan de performance (sin implementar aquí)

| Prioridad | Cambio | Impacto esperado |
|-----------|--------|------------------|
| P0 | Desactivar o degradar Three en mobile / `save-data` / low mem | LCP/INP móvil |
| P0 | `frameloop="demand"` o pause offscreen | CPU/GPU |
| P1 | Eliminar dead code Three/FX/`clsx` | Bundle |
| P1 | Elegir stack motion primario | JS + main thread |
| P2 | Split rutas: tools en `/herramientas` | Hydration home |
| P2 | Imágenes next/image + OG 1200×630 | LCP/SEO social |
| P3 | RSC-friendly sections de copy estático | TTFB/HTML |

---

## 4. Fuentes y CSS

- `next/font` Inter en `layout.tsx` — eficiente, pero genérico de marca.
- Tailwind JIT — OK.
- Admin CSS monolítico — irrelevante para LCP público.

---

## 5. Monitorización recomendada

1. Vercel Analytics / Speed Insights.
2. RUM (INP por device).
3. Budget CI: tamaño de `.next` client chunks de `/`.
4. Alerta coste LLM (proxy de “performance económica”).

---

## 6. Reglas de ingeniería

- No añadir canvas WebGL sin gate móvil.
- No montar librerías de animación nuevas sin retirar otra.
- Todo widget below-the-fold: lazy o ruta propia.
- Comentar en PR el impacto estimado en bundle/main thread.
