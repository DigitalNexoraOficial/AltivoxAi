# MEMORY — Memoria permanente del proyecto Altivox AI

> Fuente de verdad narrativa para humanos y agentes.  
> Actualizar en cada decisión técnica relevante.  
> Complementa: `architecture.md`, `todo.md`, `roadmap.md`.

---

## 1. Identidad

| Campo | Valor |
|-------|-------|
| Producto | Altivox AI (marca: AltivoxAi) |
| URL | https://www.altivoxai.es |
| Repo | DigitalNexoraOficial/AltivoxAi |
| Tipo | Agencia / plataforma IA para pymes (ES) |
| Owner | Xabier (Software engineer) |
| Hosting | Vercel |
| DB/Auth | Supabase |
| Automatización | n8n |
| Idioma producto | ES-first (+ EN dictionary) |

---

## 2. Objetivos

1. Captar y calificar leads con experiencia premium.  
2. Operar CRM ligero (leads → clientes) con automatizaciones.  
3. Evolucionar a **plataforma multiagente** supervisada por **JARVIS**.  
4. Mantener arquitectura **modular y escalable** sin rewrites totales.  
5. No improvisar: documentar → proponer → confirmar → implementar.

---

## 3. Decisiones técnicas (ADR ligero)

### ADR-001 — Dual stack (landing Next + admin HTML)

- **Decisión:** Marketing en App Router; admin en `public/*.html`.  
- **Por qué:** Velocidad de entrega del panel con Supabase CDN.  
- **Consecuencia:** Duplicación de auth/UX; CSP débil; deuda de migración.  
- **Estado:** Aceptado temporalmente; roadmap Fase D.

### ADR-002 — Scoring de leads solo en servidor

- **Decisión:** Ignorar score cliente; calcular por `fuente`.  
- **Por qué:** Evitar manipulación de hot leads.  
- **Estado:** Vigente.

### ADR-003 — n8n como bus de ops, no CRM

- **Decisión:** CRM en Supabase; n8n notifica/orquesta.  
- **Por qué:** Persistencia y RLS en DB; n8n flexible.  
- **Estado:** Vigente; workflows aún stubs.

### ADR-004 — site_settings jsonb por clave

- **Decisión:** Tabla `site_settings` key/value para brand/hero/contact/flags/social.  
- **Por qué:** Edición desde Ajustes sin redeploy.  
- **Estado:** Vigente; requiere sync manual tras seeds.

### ADR-005 — Chat = personas prompt, no agentes tools

- **Decisión:** Allowlist de nombres → system prompt.  
- **Por qué:** MVP conversacional.  
- **Estado:** A reemplazar por JARVIS + tools (no vender como multiagente real en ops).

### ADR-006 — Three.js scroll background en home

- **Decisión:** `ScrollAIBackground` siempre en `/`.  
- **Por qué:** Diferenciación visual.  
- **Consecuencia:** Coste móvil; revisar gate.  
- **Estado:** En revisión performance.

### ADR-007 — Document-first changes

- **Decisión:** Briefing 2026-08-07: auditar y documentar antes de código de producto.  
- **Estado:** Vigente para trabajo de arquitectura.

---

## 4. Estructura y ownership

| Área | Path | Owner conceptual |
|------|------|------------------|
| Landing | `src/app/page.tsx`, `components/sections` | Frontend + Contenido |
| Tools | `components/tools`, GrowthSuite | Marketing + Frontend |
| Chat | `components/chat`, `api/chat` | Chatbots + IA |
| APIs | `src/app/api` | Backend |
| Admin | `public/*.html`, `assets/js|css` | Administración |
| SQL | `supabase/sql` | Base de datos |
| n8n | `n8n/` | Automatizaciones |
| Docs | `docs/` | Arquitectura |

---

## 5. Dependencias runtime (congelado conceptual)

Next 16.3 · React 19.2 · three/R3F/drei · framer-motion · gsap · lenis · Tailwind 3  
**Sin uso:** `clsx`  
**CDN admin:** `@supabase/supabase-js` jsDelivr  

Detalle: `package.json` / auditoría en `architecture.md`.

---

## 6. Convenciones de nombres

- React components: `PascalCase.tsx`
- Hooks futuros: `useX.ts` en `src/hooks/`
- API routes: `src/app/api/<name>/route.ts`
- Eventos: `dominio.accion` (`lead.created`)
- SQL files: kebab-case en `supabase/sql/`
- Branches cloud: `cursor/<descriptive>-4521`
- Docs: kebab/english filenames, contenido ES

---

## 7. Componentes clave (índice)

Ver listado auditado en `architecture.md` §3 y flujo en `flow.md`.  
Huérfanos conocidos: `HeroAtmosphere`, `HeroScene`, `BackgroundFX`.

---

## 8. Tareas pendientes

Fuente operativa: [`todo.md`](./todo.md).  
Roadmap fases: [`roadmap.md`](./roadmap.md).

---

## 9. Historial de cambios (memoria)

| Fecha | Cambio | Ref |
|-------|--------|-----|
| 2026-08 | Hardening APIs, publish Next en dominio | commits `67a1ae9`… |
| 2026-08 | Mobile chrome FAB/sticky | `fe3fa7f` |
| 2026-08 | Admin premium + site_settings | `b8ca1b8` |
| 2026-08-07 | Auditoría + `/docs` arquitectura multiagente | rama `cursor/architecture-docs-4521` |
| 2026-08 | WhatsApp → +34633906519 (defaults) | rama phone / PR asociado |

---

## 10. Propuestas pendientes de confirmación (Fase 5)

Ver sección final del mensaje de entrega / `todo.md` P0–P1.  
**Ninguna se aplica sin OK explícito del owner.**

---

## 11. Cómo actualizar esta memoria

1. Toda ADR nueva → sección 3.  
2. Todo merge relevante → sección 9 (una línea).  
3. No duplicar specs largas: enlazar al doc especializado.  
4. Si un hecho en MEMORY contradice el código, **gana el código** y se corrige MEMORY en el mismo PR.
