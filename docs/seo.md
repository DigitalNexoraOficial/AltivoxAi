# SEO — Altivox AI

---

## 1. Estado actual

| Activo | Ubicación | Notas |
|--------|-----------|-------|
| Metadata root | `src/app/layout.tsx` | title, description, canonical, OG, Twitter |
| `metadataBase` | `https://www.altivoxai.es` | OK |
| JSON-LD Organization | `src/app/page.tsx` | Básico |
| `robots.txt` | `public/robots.txt` | Disallow admin, api, portal, design-system |
| `sitemap.xml` | `public/sitemap.xml` | `/` + 2 casos |
| GSC verify | `public/google449c5ca2bda35223.html` | Presente |
| Casos SSG | `src/app/casos/[slug]` | `generateStaticParams` |
| i18n | ES default + EN dictionary | `lang="es"` |

---

## 2. Fortalezas

- Intención clara: agencia IA / pymes / ES.
- Casos indexables con rutas propias.
- Bloqueo correcto de superficies internas.
- HTML de secciones marketing SSR-able (client components siguen emitiendo HTML inicial).

---

## 3. Gaps

1. **OG image = favicon** — pobre en redes; Twitter `summary` en lugar de large image.
2. **Sin `generateMetadata` por caso** — títulos/descripciones genéricas o heredadas.
3. **Sitemap estático** — no crece con contenido; falta blog.
4. **No hay `/blog`** — `cmsPosts` solo alimentan Insights.
5. **Schema incompleto** — falta `FAQPage`, `Service`/`Offer`, `BreadcrumbList` en casos.
6. **Copy mixto** — algunos subtítulos EN en UI ES (FAQ).
7. **CWV** — Three + motion pueden degradar rankings móviles (ver [`performance.md`](./performance.md)).
8. **Sin `sitemap.ts` / `robots.ts` App Router** — duplicidad mental con `public/`.

---

## 4. Arquitectura SEO objetivo

```
App Router Metadata API
  ├─ layout (defaults)
  ├─ page home (+ FAQ/Offer JSON-LD)
  ├─ casos/[slug] generateMetadata + Breadcrumb
  └─ blog/[slug] (futuro)

sitemap.ts ← cmsCases + cmsPosts + estáticas
robots.ts  ← mirror política actual
OG pipeline ← /og default + por página
```

---

## 5. Contenido

| Pieza | Ahora | Objetivo |
|-------|-------|----------|
| Home | Larga, keyword-rich | Mantener + FAQ schema |
| Casos | 2 SSG | 5–10 + metadata |
| Insights | Sección | Posts MDX `/blog` |
| Guía PDF | Lead magnet | Landing `/recursos/guia` indexable opcional |
| Local | areaServed ES | Reforzar LocalBusiness si hay NAP real |

---

## 6. Checklist operativo

- [ ] Generar OG 1200×630 marca
- [ ] Metadata por caso
- [ ] FAQPage JSON-LD desde `Faq`
- [ ] Sitemap dinámico
- [ ] Medir indexación GSC (cobertura, CWV)
- [ ] Unificar idioma visible ES-first
- [ ] Evitar thin pages (`/portal` ya en noindex)

---

## 7. Relación conversión

SEO alimenta el embudo de [`flow.md`](./flow.md):  
organic → landing → tools → lead → CRM.  
Cada pieza de contenido nueva debe tener **un CTA medible** (fuente de lead distinta).
