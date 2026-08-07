# Arquitectura Altivox AI

**Producto:** plataforma de captación, conversión y operación con IA para pymes.  
**Dominio:** https://www.altivoxai.es  
**Stack actual:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 3 · Supabase · n8n · Vercel  
**Fecha de auditoría:** 2026-08-07 · Estado: producción operativa + documentación Fases 1–4

---

## 1. Informe de auditoría (Fase 1)

### 1.1 Qué está bien

- Landing Next.js con secciones claras, CMS estático de casos (`src/content/cms.ts`) y metadata base + JSON-LD Organization.
- Captura de leads endurecida: allowlists, límites de body, scoring **server-side** por `fuente` (`src/app/api/lead/route.ts`).
- Bridge n8n con autenticación (`N8N_SECRET` o JWT Supabase), no emit público abierto.
- Feature flags y contenido editable vía `site_settings` + Admin → Ajustes.
- Diferido de extras (`DeferredExtras`, `GrowthSuite`) y Three.js con `dynamic(..., { ssr: false })`.
- Headers de seguridad (CSP, HSTS, nosniff, frame-ancestors) en `next.config.ts`.
- Panel admin unificado con shell compartido (`admin-core.js` + `admin.css`).
- SQL con RLS básico para `leads`, `clientes`, `site_settings`.
- `prefers-reduced-motion` considerado en varios puntos de la experiencia.

### 1.2 Qué está mal o es frágil

- **Dos productos en uno:** marketing en React/App Router vs admin en HTML/JS estático (`public/*.html`) sin capa de dominio compartida.
- **“Agentes” ≠ plataforma multiagente:** `/api/chat` solo cambia el nombre/prompt; `agentes.html` guarda toggles en `localStorage` sin efecto en producción.
- **JARVIS** es una pantalla de scoring/UI, no un supervisor orquestador.
- Three.js (`ScrollAIScene`) con `frameloop="always"` en **todos** los dispositivos → coste GPU/móvil alto.
- Rate limits en memoria (`Map`) ineficaces en serverless multi-instancia.
- Authz débil: cualquier usuario `authenticated` en Supabase puede operar CRM/n8n; RLS `using (true)`.
- Admin sin middleware: las rutas HTML son públicas; el login es solo client-side.
- CSP permite `'unsafe-inline'` / `'unsafe-eval'` + CDN jsDelivr (necesario en parte por el admin legacy).
- SEO: OG = favicon; sitemap estático; sin metadata por ruta en casos/portal.
- Dependencias muertas/huérfanas: `clsx` sin uso; `HeroAtmosphere` / `HeroScene` / `BackgroundFX` no montados.
- Duplicación: `n8n-bridge` TS + JS; `chat-leads.sql` vs `auth-admin-only.sql`; headers en `next.config` y `vercel.json`.

### 1.3 Qué se puede mejorar

- Unificar admin en App Router (`/admin/*`) con RBAC real.
- Extraer capa de dominio (`src/domain/`, `src/server/`) para leads, clientes, eventos, agentes.
- Orquestador JARVIS (cola de tareas, routing, tools, memoria, evaluación).
- Rate limiting durable (Upstash/Redis) + bot protection en chat/lead.
- Reducir stack de motion (elegir Framer **o** GSAP+Lenis como primario).
- Blog real (hoy Insights/CMS posts sin ruta `/blog`).
- Observabilidad: logs estructurados, tracing, presupuestos LLM.
- Tests (unit + API + e2e críticos) y CI.

### 1.4 Qué sobra

- Componentes Three/FX no usados.
- `public/_legacy/` vacío.
- `clsx` sin imports.
- Portal demo y CrmDemo si no hay roadmap de producto cliente (mantener solo si son marketing consciente).
- README desactualizado (“Next.js 15+”).

### 1.5 Qué falta

- Documentación de arquitectura (este `/docs` la inicia).
- Middleware Edge, roles admin, auditoría de acciones.
- Orquestación multiagente real (tools, handoff, memoria).
- Blog/CMS dinámico, schema FAQ/Offer, OG images.
- Suite de tests y budgets de rendimiento.
- Contratos de eventos versionados (n8n ↔ API).

---

## 2. Vista de capas (estado actual)

```
┌─────────────────────────────────────────────────────────────┐
│  Experiencia pública (Next.js App Router)                   │
│  /  /casos/[slug]  /bienvenida  /portal  /design-system     │
├─────────────────────────────────────────────────────────────┤
│  APIs Route Handlers                                        │
│  /api/lead  /api/chat  /api/n8n  /api/site-settings  /api/ig│
├─────────────────────────────────────────────────────────────┤
│  Admin estático (public/*.html + admin-core + Supabase CDN) │
├──────────────┬──────────────────────┬───────────────────────┤
│  Supabase    │  LLM (OpenRouter →   │  n8n webhooks         │
│  Auth+DB     │  Gemini fallback)    │  lead/ops workflows   │
└──────────────┴──────────────────────┴───────────────────────┘
```

### 2.1 Arquitectura objetivo (empresa)

```
Cliente Web / Admin App / Chat / WhatsApp
                 │
         ┌───────▼────────┐
         │  Edge Gateway  │  auth · rate limit · CORS · bot
         └───────┬────────┘
                 │
    ┌────────────▼────────────┐
    │   Application Services  │  Lead · CRM · Content · Chat
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │   JARVIS Orchestrator   │  routing · tools · memory · QA
    └────────────┬────────────┘
         ┌───────┴────────┐
         ▼                ▼
   Agent Workers     Event Bus → n8n / CRM / Analytics
         │
   Supabase + Object Storage + Vector (futuro)
```

Principios: **modular**, **event-driven**, **RBAC**, **un solo admin**, **agentes como workers con contratos**, no prompts sueltos.

---

## 3. Estructura de carpetas (mapa real)

| Ruta | Rol |
|------|-----|
| `src/app/` | Rutas, layout, globals, APIs |
| `src/components/sections/` | Bloques de landing |
| `src/components/tools/` | Audit, quiz, comparador, CRM demo |
| `src/components/chat/` | Widget multi-etiqueta |
| `src/components/three/` | Fondo R3F |
| `src/components/experience/` | Loader, booking, WA, deferred |
| `src/components/providers/` | Theme, i18n, industry, Lenis, settings |
| `src/components/ui/` | Sticky CTA, reveal, skip link |
| `src/content/` | CMS estático casos/posts |
| `src/lib/` | i18n, brand, n8n, sound, A/B |
| `public/` | Admin HTML, SEO, assets, guía PDF |
| `supabase/sql/` | Esquemas y RLS |
| `n8n/workflows/` | Export JSON de automatizaciones |
| `docs/` | Documentación de producto/arquitectura |

---

## 4. Decisiones técnicas vigentes

Documentadas en detalle en [`MEMORY.md`](./MEMORY.md). Resumen:

1. Landing App Router + admin HTML (deuda consciente a migrar).
2. Supabase como Auth + Postgres + REST; service role en APIs server.
3. n8n como capa de notificaciones/ops, no como CRM.
4. Lead scoring solo en servidor.
5. Contenido marketing parcialmente editable vía `site_settings`.

---

## 5. Convenciones

- Componentes React: PascalCase; archivos alineados al export.
- APIs: `route.ts` con CORS allowlist + validación allowlist de campos.
- Admin: `AltivoxAdmin.*` / `AltivoxN8n.*` en global window.
- SQL: idempotente (`if not exists`, `on conflict`, `drop policy if exists`).
- Eventos n8n: `lead.*`, `cliente.*`, `jarvis.*`, `system.ping`.
- Ramas cloud: `cursor/<nombre>-4521`.

---

## 6. Relación con otros docs

| Doc | Contenido |
|-----|-----------|
| [`agents.md`](./agents.md) | Organigrama JARVIS + agentes |
| [`flow.md`](./flow.md) | Mapa usuario → CRM |
| [`bots.md`](./bots.md) | Chatbots y prompts |
| [`api.md`](./api.md) | Contratos HTTP |
| [`database.md`](./database.md) | Modelo de datos |
| [`security.md`](./security.md) | Amenazas y controles |
| [`performance.md`](./performance.md) | Presupuestos y bottlenecks |
| [`seo.md`](./seo.md) | SEO técnico/contenido |
| [`deployment.md`](./deployment.md) | Vercel, env, n8n |
| [`roadmap.md`](./roadmap.md) | Fases de producto |
| [`todo.md`](./todo.md) | Backlog priorizado |
| [`MEMORY.md`](./MEMORY.md) | Memoria permanente |
