# Agentes Altivox AI — Organigrama y contratos

**Supervisor:** JARVIS  
**Estado actual:** la mayoría de agentes son **roles de producto/documentación**. En código solo existen etiquetas de chat (`asistente`, `investigador`, `diseñador`, `auditoría`, `creativo`, `sistemas`) en `src/app/api/chat/route.ts` y UI cosméticas en `public/agentes.html` / `public/jarvis.html`.

Este documento define el **organigrama objetivo** listo para implementar sin rehacer la arquitectura.

---

## 1. Organigrama

```
                         ┌──────────────┐
                         │    JARVIS    │
                         │  Supervisor  │
                         └──────┬───────┘
            ┌───────────────────┼───────────────────┐
            ▼                   ▼                   ▼
     Adquisición          Entrega               Operaciones
   Comercial              Diseño                Atención
   Marketing              Frontend              CRM
   SEO / Contenido        Backend               Analítica
   Blog / RRSS            Chatbots              Base de datos
                          IA / Automatizaciones QA
                          Admin                 Seguridad
                                                DevOps
```

JARVIS no “habla por todos”: **enruta, prioriza, audita y consolida**.

---

## 2. JARVIS (Supervisor)

| Campo | Definición |
|-------|------------|
| **Objetivo** | Coordinar agentes, garantizar calidad, seguridad y conversión; ser la única interfaz de orquestación. |
| **Responsabilidades** | Routing de tareas; handoff entre agentes; scoring de leads; políticas (PII, presupuesto LLM); consolidar respuestas; registrar eventos. |
| **Entradas** | Eventos (`lead.created`, chat, tickets), contexto de sesión, `site_settings`, estado CRM. |
| **Salidas** | Plan de ejecución, asignación a agente, respuesta unificada al usuario, eventos `jarvis.*`. |
| **Archivos actuales** | `public/jarvis.html`, scoring en `src/app/api/lead/route.ts`, menciones en n8n events. |
| **Tecnologías** | Next.js API · Supabase · n8n · LLM gateway · (futuro) cola + tools. |
| **Mejoras** | State machine; tool-calling; memoria conversacional; evals; no UI-only. |

---

## 3. Catálogo de agentes

### 3.1 Comercial

| Campo | Definición |
|-------|------------|
| **Objetivo** | Calificar y convertir leads en reuniones/pilotos. |
| **Responsabilidades** | Scripts de calificación; propuesta de paquete; seguimiento hot leads; handoff a CRM. |
| **Entradas** | Lead (`fuente`, mensaje, industria), score, historial chat. |
| **Salidas** | Clasificación, next-best-action, borrador WhatsApp/email, evento `lead.contacted`. |
| **Archivos** | `Contact.tsx`, `BookingModal.tsx`, `dashboard.html`, `/api/lead`. |
| **Tecnologías** | Supabase leads · WhatsApp · Cal · n8n. |
| **Futuro** | Playbooks por industria; SDR agent con tools CRM. |

### 3.2 Marketing

| Campo | Definición |
|-------|------------|
| **Objetivo** | Generar demanda cualificada y consistencia de marca. |
| **Responsabilidades** | Mensajes por industria; lead magnets; campañas; A/B copy. |
| **Entradas** | Industria, variantes A/B (`src/lib/ab.ts`), flags. |
| **Salidas** | Copy, creatividades, eventos de campaña. |
| **Archivos** | `Hero.tsx`, `LeadMagnet.tsx`, `IndustryProvider`, `Insights.tsx`, `/api/ig-image`. |
| **Tecnologías** | Next · CMS · IG assets. |
| **Futuro** | Integración Ads/Analytics; calendario editorial. |

### 3.3 Diseño

| Campo | Definición |
|-------|------------|
| **Objetivo** | UX/UI premium coherente con el brand system. |
| **Responsabilidades** | Tokens, motion rules, layouts, admin aesthetics. |
| **Entradas** | Brand tokens, brief de sección. |
| **Salidas** | Componentes, CSS tokens, guías visuales. |
| **Archivos** | `src/lib/brand-system.ts`, `globals.css`, `admin.css`, `design-system/page.tsx`. |
| **Tecnologías** | Tailwind · Framer · GSAP. |
| **Futuro** | Design tokens JSON únicos web+admin; Storybook. |

### 3.4 Desarrollo Frontend

| Campo | Definición |
|-------|------------|
| **Objetivo** | Experiencia web rápida, accesible y mantenible. |
| **Responsabilidades** | Secciones, providers, widgets, admin React (objetivo). |
| **Entradas** | Specs UX, APIs, content. |
| **Salidas** | Componentes App Router, bundles optimizados. |
| **Archivos** | `src/components/**`, `src/app/**`. |
| **Tecnologías** | Next 16 · React 19 · TS · Tailwind. |
| **Futuro** | Migrar admin HTML → App Router; reducir client boundary. |

### 3.5 Desarrollo Backend

| Campo | Definición |
|-------|------------|
| **Objetivo** | APIs seguras, contratos claros, integridad de datos. |
| **Responsabilidades** | Route handlers, validación, integraciones, jobs. |
| **Entradas** | HTTP requests, webhooks, env secrets. |
| **Salidas** | JSON APIs, side-effects (DB, n8n, LLM). |
| **Archivos** | `src/app/api/**`, `src/lib/n8n-bridge.ts`. |
| **Tecnologías** | Next Route Handlers · Supabase REST · n8n. |
| **Futuro** | `src/server/` compartido; OpenAPI; colas. |

### 3.6 SEO

| Campo | Definición |
|-------|------------|
| **Objetivo** | Visibilidad orgánica cualificada (ES, pymes + IA). |
| **Responsabilidades** | Metadata, sitemap, schema, CWV, contenido indexable. |
| **Entradas** | Páginas, casos, posts. |
| **Salidas** | Metadata, JSON-LD, sitemap dinámico. |
| **Archivos** | `layout.tsx`, `robots.txt`, `sitemap.xml`, `casos/[slug]`. |
| **Tecnologías** | Next Metadata API · schema.org. |
| **Futuro** | Ver [`seo.md`](./seo.md). |

### 3.7 Automatizaciones

| Campo | Definición |
|-------|------------|
| **Objetivo** | Orquestar flujos lead → notify → CRM sin código ad-hoc. |
| **Responsabilidades** | Workflows n8n, contratos de eventos, reintentos. |
| **Entradas** | Eventos API `/api/n8n` y webhooks salientes. |
| **Salidas** | Notificaciones, updates CRM, digests. |
| **Archivos** | `n8n/workflows/*`, `n8n/README.md`, `/api/n8n`. |
| **Tecnologías** | n8n · webhooks · Data Tables (doc). |
| **Futuro** | Inbox de eventos versionado; dead-letter. |

### 3.8 Chatbots

| Campo | Definición |
|-------|------------|
| **Objetivo** | Conversación útil 24/7 con handoff a humano/comercial. |
| **Responsabilidades** | UI chat, prompts, límites, captura de intención. |
| **Entradas** | Mensaje usuario, agente seleccionado, industria. |
| **Salidas** | Respuesta LLM; (futuro) lead auto-creado. |
| **Archivos** | `ChatWidget.tsx`, `/api/chat`, `chatbot.html`. |
| **Tecnologías** | OpenRouter · Gemini · rate limit. |
| **Futuro** | Tools (lead, booking); memoria; guardrails. |

### 3.9 IA

| Campo | Definición |
|-------|------------|
| **Objetivo** | Capacidad cognitiva compartida (modelos, evals, prompts). |
| **Responsabilidades** | Gateway LLM, catálogo de prompts, coste, calidad. |
| **Entradas** | Prompts + contexto. |
| **Salidas** | Completions, embeddings (futuro), scores. |
| **Archivos** | `/api/chat`, scoring lead, `jarvis.html`. |
| **Tecnologías** | OpenRouter · Gemini · (futuro) vector store. |
| **Futuro** | Prompt registry en DB; eval harness. |

### 3.10 Atención al cliente

| Campo | Definición |
|-------|------------|
| **Objetivo** | Resolver incidencias y dudas post-venta. |
| **Responsabilidades** | SLA, plantillas, escalado a humano. |
| **Entradas** | Ticket, cliente, historial. |
| **Salidas** | Respuesta, estado ticket. |
| **Archivos** | Hoy: WhatsApp CTA + email; sin ticketing. |
| **Tecnologías** | WA · email · (futuro) Helpdesk. |
| **Futuro** | Tabla `tickets` + agente con tools. |

### 3.11 Analítica

| Campo | Definición |
|-------|------------|
| **Objetivo** | Medir funnel, ROI de agentes y CWV. |
| **Responsabilidades** | Eventos, dashboards, atribución. |
| **Entradas** | `trackEvent` A/B, leads, conversiones. |
| **Salidas** | KPIs, alertas. |
| **Archivos** | `src/lib/ab.ts`, KPIs en `dashboard.html`. |
| **Tecnologías** | localStorage A/B · (futuro) GA4/Plausible + warehouse. |
| **Futuro** | Event pipeline unificado. |

### 3.12 CRM

| Campo | Definición |
|-------|------------|
| **Objetivo** | Ciclo de vida lead → cliente. |
| **Responsabilidades** | CRUD clientes, conversión, notas, estados. |
| **Entradas** | Leads, formularios admin, n8n. |
| **Salidas** | Registros `clientes`, CSV, WA links. |
| **Archivos** | `clientes.html`, `dashboard.html`, `clientes.sql`, n8n ops. |
| **Tecnologías** | Supabase · admin JS. |
| **Futuro** | Pipeline kanban real; actividades; permisos. |

### 3.13 Base de datos

| Campo | Definición |
|-------|------------|
| **Objetivo** | Modelo de datos íntegro, migrable y seguro. |
| **Responsabilidades** | SQL, RLS, índices, migraciones. |
| **Entradas** | Specs de dominio. |
| **Salidas** | Schemas en `supabase/sql`. |
| **Archivos** | `supabase/sql/*`, `chat-leads.sql` (duplicado). |
| **Tecnologías** | Postgres · Supabase. |
| **Futuro** | Migraciones versionadas; roles; audit log. |

### 3.14 QA

| Campo | Definición |
|-------|------------|
| **Objetivo** | Prevenir regresiones y alucinaciones dañinas. |
| **Responsabilidades** | Tests, checklists, evals de prompts. |
| **Entradas** | PRs, outputs LLM. |
| **Salidas** | Reportes, gates CI. |
| **Archivos** | Hoy: lint only (`npm run lint`). |
| **Tecnologías** | ESLint · (futuro) Playwright · Vitest. |
| **Futuro** | CI obligatorio build+lint+e2e smoke. |

### 3.15 Seguridad

| Campo | Definición |
|-------|------------|
| **Objetivo** | Minimizar abuso, fuga de datos y coste LLM. |
| **Responsabilidades** | Authz, secrets, CSP, rate limits, PII. |
| **Entradas** | Requests, políticas. |
| **Salidas** | Controles, auditorías. |
| **Archivos** | `next.config.ts`, APIs, SQL RLS. |
| **Tecnologías** | CSP · JWT · RLS. |
| **Futuro** | Ver [`security.md`](./security.md). |

### 3.16 DevOps

| Campo | Definición |
|-------|------------|
| **Objetivo** | Deploy fiable, entornos y secretos. |
| **Responsabilidades** | Vercel, env, n8n, DNS, previews. |
| **Entradas** | Git main/PRs. |
| **Salidas** | Producción `www.altivoxai.es`. |
| **Archivos** | `vercel.json`, `next.config.ts`, `deployment.md`. |
| **Tecnologías** | Vercel · GitHub · Supabase · n8n Cloud. |
| **Futuro** | Preview envs documentados; status checks. |

### 3.17 Contenido

| Campo | Definición |
|-------|------------|
| **Objetivo** | Narrativa de marca y ofertas claras. |
| **Responsabilidades** | Copy ES/EN, ofertas, FAQ, guía PDF. |
| **Entradas** | Brief comercial. |
| **Salidas** | `i18n.ts`, CMS, guía. |
| **Archivos** | `src/lib/i18n.ts`, `cms.ts`, `public/assets/guia/*`. |
| **Tecnologías** | TS dictionaries · PDF. |
| **Futuro** | CMS headless o MDX. |

### 3.18 Blog

| Campo | Definición |
|-------|------------|
| **Objetivo** | Autoridad SEO y nurturing. |
| **Responsabilidades** | Posts, categorías, CTAs. |
| **Entradas** | Borradores contenido. |
| **Salidas** | Rutas `/blog` (objetivo); hoy `cmsPosts` en Insights. |
| **Archivos** | `src/content/cms.ts`, `Insights.tsx`. |
| **Tecnologías** | MDX/CMS (objetivo). |
| **Futuro** | Rutas SSG + sitemap automático. |

### 3.19 Redes sociales

| Campo | Definición |
|-------|------------|
| **Objetivo** | Distribución y prueba social. |
| **Responsabilidades** | Assets IG, captions, calendario. |
| **Entradas** | Temas (`chatbot`, `leads`, `agents`). |
| **Salidas** | PNGs vía `/api/ig-image`. |
| **Archivos** | `public/assets/ig/*`, `/api/ig-image`. |
| **Tecnologías** | Static assets · redirect API. |
| **Futuro** | Generación asistida + scheduling. |

### 3.20 Administración

| Campo | Definición |
|-------|------------|
| **Objetivo** | Operar el negocio desde un panel seguro. |
| **Responsabilidades** | Login, leads, clientes, ajustes web, health. |
| **Entradas** | Auth Supabase. |
| **Salidas** | Mutaciones DB/settings. |
| **Archivos** | `public/login|dashboard|clientes|ajustes|*.html`, `admin-core.js`. |
| **Tecnologías** | Supabase Auth · HTML/JS. |
| **Futuro** | App Router admin + RBAC. |

---

## 4. Matriz de madurez

| Agente | Hoy | Objetivo próximo |
|--------|-----|------------------|
| JARVIS | UI + scoring lead | Orquestador con tools |
| Comercial | Formularios + dashboard | Playbooks + WA drafts |
| Chatbots | Prompt labels | Tools + memoria |
| CRM | HTML CRUD | Pipeline + actividades |
| Automatizaciones | 2 workflows stub | Hub eventos completo |
| SEO / Blog | Básico | Blog + schema + OG |
| Seguridad | Headers + allowlists | RBAC + rate durable |
| QA / DevOps | Lint + Vercel | CI gates |

---

## 5. Regla de implementación

Ningún agente nuevo se añade solo como string en `ALLOWED_AGENTS`.  
Debe existir: **contrato de entradas/salidas**, **owner**, **tests mínimos**, y **registro en JARVIS**.
