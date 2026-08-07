# Arquitectura — Altivox OS

**Producto:** Altivox OS — Sistema Operativo interno de Altivox AI  
**Escaparate:** web pública https://www.altivoxai.es  
**Visión oficial:** [`product-vision.md`](./product-vision.md)  
**ADRs:** [`ADR-010`](./adr/ADR-010-altivox-os-pivot.md) · [`ADR-011`](./adr/ADR-011-core-engines.md) · [`ADR-012`](./adr/ADR-012-security-foundation.md) · [`ADR-013`](./adr/ADR-013-project-engine.md) · [`ADR-014`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md) · [`ADR-015`](./adr/ADR-015-bloque-5-agent-runtime.md) · [`ADR-016`](./adr/ADR-016-bloque-6-review-engine.md) · [`ADR-017`](./adr/ADR-017-bloque-7-deploy-engine.md)  
**Motores del núcleo:** [`core-engines.md`](./core-engines.md)  
**Actualizado:** 2026-08-07 · Prebloque B7-A (ADR-017; sin implementación Deploy)

---

## 1. Principios

1. **Tres superficies** — pública / `/ops` / `/r/[token]`. Nunca mezclar concerns.  
2. **Núcleo estable** — añadir servicios solo como **módulos/plugins** vía interfaces.  
3. **JARVIS orquesta** — no ejecuta entrega; no crea proyectos directo; usa Project Engine + Workflow Engine + Capability Registry (+ Review/Agent vía caller según ADR).  
4. **Agentes privados** — solo OS; I/O solo vía Tool Registry; memoria solo vía Memory Engine; **nunca** en `/r`.  
5. **Capabilities antes que agentes** — los proyectos declaran capacidades; JARVIS elige agentes.  
6. **Ciclo de vida único** — [`flow.md`](./flow.md).  
7. **Autorización en servidor** — RBAC + RLS; portal review por token (ADR-016).  
8. **Registro total** — auditado en Memory Engine / event log / stores de dominio.  
9. **Clean Architecture / SOLID / DRY / KISS** — TypeScript estricto.  
10. **Fase PE `review` ≠ Review Engine** — ADR-016.

---

## 2. Diagrama de superficies

```
┌─────────────────────────────────────────────────────────────┐
│  1. WEB PÚBLICA  (/ , /casos, …)                            │
│  Marketing · captación · info · chat comercial · forms      │
└───────────────────────────┬─────────────────────────────────┘
                            │ leads / mensajes
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. ALTIVOX OS  (/ops)     ← Centro de operaciones          │
│  CRM · Clientes · Proyectos · JARVIS · Agentes · Tools      │
│  Workflows · Memoria · Logs · Analítica · Deploy · Config   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ OS CORE (estable)                                    │   │
│  │ Project Engine · Workflow Engine · Tool Registry     │   │
│  │ Memory Engine · Capability Registry · Agent Manager  │   │
│  │ Event Bus · Logger · Config · API Gateway · RBAC     │   │
│  └───────────────────────┬──────────────────────────────┘   │
│                          │ interfaces                       │
│         ┌────────────────┼────────────────┐                 │
│         ▼                ▼                ▼                 │
│     JARVIS         Service Modules    Agent runtime         │
│   (orquesta)         (plugins)         (privado · B5)       │
│         │                                                   │
│         └── caller → Review Engine (B6 · contrato ADR-016)  │
└───────────────────────────┬─────────────────────────────────┘
                            │ versión candidata + token
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. PORTAL REVISIÓN  (/r/[token])  ← ADR-016 · implementado │
│  Entregables · comentarios · cambios · aprobar/rechazar     │
│  Sin agentes · sin prompts · sin datos internos             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Núcleo vs módulos

### 3.1 Núcleo (no se modifica por servicio nuevo)

**Motores oficiales** (detalle: [`core-engines.md`](./core-engines.md)):

| Motor | Dueño de | Fase |
|-------|----------|------|
| **Project Engine** | Proyectos, estados (B2), versiones, entregables, eventos de dominio. Review tokens / deploys = **diferidos** ([ADR-013](./adr/ADR-013-project-engine.md)) | **Cerrado (B2)** |
| **Workflow Engine** | Procesos reutilizables | Frontera en B4 · runtime posterior |
| **Tool Registry** | I/O externo | Frontera B4 · runtime **mínimo** LLM en B5 · vendors publish = **B7 (ADR-017)** |
| **Memory Engine** | Memoria runtime | Frontera B4 · runtime **mínimo** runs en B5 · KB corporativa posterior |
| **Capability Registry** | Capabilities → agentes | Frontera B4 · runtime **mínimo** manifests en B5 |

Además: Identidad/RBAC (B1) · Agent Manager + Agent Runtime (**B5**) · Review Engine (**B6**) · **Deploy Engine (B7 · ADR-017 · no implementado)** · Event Bus · Logger · Configuration · API Gateway `/api/ops/*` + `/api/review/*`.

JARVIS es **orquestador caller** ([`ADR-014`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md) / [`ADR-015`](./adr/ADR-015-bloque-5-agent-runtime.md) / [`ADR-016`](./adr/ADR-016-bloque-6-review-engine.md)), no el almacén de proyectos ni el portal cliente.

### 3.2 Módulos / plugins de servicio

Cada oferta de Altivox es un **módulo** que declara:

- `serviceType`  
- **capabilities** tipicas (no agent IDs fijos)  
- plantillas de workflow / planificación  
- tools permitidos (ids del Tool Registry)  
- criterios de QA · formato de entregable · adapters de deploy  

Descubrimiento por manifest; cero `if/else` de servicio en el core.  
**B5:** módulo `web` implementado. Deploy adapters = **B7**.

---

## 4. Estado actual del código (as-is)

| Pieza | Estado |
|-------|--------|
| Landing Next.js 16 | Producción |
| Admin HTML `public/*.html` | Producción temporal ≠ `/ops` |
| APIs lead/chat/n8n/site-settings | Producción |
| Supabase leads/clientes/site_settings + audit + PE | Producción / entorno (SQL B1–B2) |
| Project Engine (B2) | **Implementado** (ADR-013) |
| Shell `/ops` + UI Proyectos (B3) | **Implementado** |
| JARVIS Core + fronteras motores (B4) | **Implementado** (ADR-014) |
| Agent runtime · service modules | **Implementado** (ADR-015 · sin UI completa) |
| `/r/[token]` · Review Engine | **Implementado** ([`ADR-016`](./adr/ADR-016-bloque-6-review-engine.md)) |
| Deploy / ZIP | **No implementado** — contrato [`ADR-017`](./adr/ADR-017-bloque-7-deploy-engine.md) |
| Extensión modular formal | **Parcial** — módulo `web` (B5) |

---

## 5. Arquitectura objetivo (to-be) — capas

```
UI (/ops, /r, pública)
  → API Gateway
    → JARVIS (orquestación) + Application services
      → Project Engine · Workflow Engine · Capability Registry
      → Agent Manager → agents (interno)
      → Review Engine → /r/[token] (cliente)
      → Memory Engine
      → Tool Registry → adapters (GitHub, Vercel, LLMs, n8n, …)
      → Domain entities (Client, Lead, Module manifests)
```

Carpetas objetivo (no crear Review/Deploy sin OK de bloque):

- `src/core` — núcleo OS  
- `src/modules` — plugins de servicio  
- `src/domain` · `src/server` · `src/services` · `src/types` · `src/config`  
- Mantener `src/lib` para utilidades compartidas no de dominio  

---

## 6. Seguridad (resumen)

Ver [`security.md`](./security.md) · [`ADR-016`](./adr/ADR-016-bloque-6-review-engine.md).

- `/ops` y `/api/ops/*`: autenticación + RBAC.  
- `/r/[token]`: autorización por token de revisión; sin sesión staff; `noindex`.  
- Agentes y prompts: nunca en respuestas del portal ni de la web pública.  
- Deploy: solo B7 (ADR-017); confirmación humana; sin auto-publish.

---

## 7. Documentación relacionada

| Doc | Rol |
|-----|-----|
| [`product-vision.md`](./product-vision.md) | Visión 3–5 años |
| [`core-engines.md`](./core-engines.md) | Cinco motores del núcleo |
| [`flow.md`](./flow.md) | Ciclo de vida oficial |
| [`agents.md`](./agents.md) | JARVIS + agentes privados |
| [`roadmap.md`](./roadmap.md) | Orden de bloques |
| [`database.md`](./database.md) | Modelo as-is / to-be |
| [`api.md`](./api.md) | Contratos HTTP |
| [`MEMORY.md`](./MEMORY.md) | Memoria humana + ADRs |
| [`adr/ADR-015-bloque-5-agent-runtime.md`](./adr/ADR-015-bloque-5-agent-runtime.md) | Corte Bloque 5 |
| [`adr/ADR-016-bloque-6-review-engine.md`](./adr/ADR-016-bloque-6-review-engine.md) | Corte Bloque 6 |
| [`adr/ADR-017-bloque-7-deploy-engine.md`](./adr/ADR-017-bloque-7-deploy-engine.md) | Corte Bloque 7 |
