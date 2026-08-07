# Arquitectura — Altivox OS

**Producto:** Altivox OS — Sistema Operativo interno de Altivox AI  
**Escaparate:** web pública https://www.altivoxai.es  
**Visión oficial:** [`product-vision.md`](./product-vision.md) · **ADR:** [`adr/ADR-010-altivox-os-pivot.md`](./adr/ADR-010-altivox-os-pivot.md)  
**Actualizado:** 2026-08-07 · Bloque 0

---

## 1. Principios

1. **Tres superficies** — pública / `/ops` / `/r/[token]`. Nunca mezclar concerns.  
2. **Núcleo estable** — añadir servicios solo como **módulos/plugins** vía interfaces.  
3. **JARVIS orquesta** — no ejecuta trabajo de entrega; asigna y consolida.  
4. **Agentes privados** — solo dentro del OS; invisibles al cliente.  
5. **Ciclo de vida único** — ver [`flow.md`](./flow.md); todo desarrollo se alinea a él.  
6. **Autorización en servidor** — RBAC + RLS; el cliente UI no es frontera de seguridad.  
7. **Registro total** — cada transición de estado, run de agente, aprobación y deploy queda auditado.  
8. **Clean Architecture / SOLID / DRY / KISS** — TypeScript estricto; DDD donde aporte (Proyecto, Cliente, Módulo de servicio).

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
│  ┌─────────────┐    interfaces     ┌────────────────────┐   │
│  │  OS Core    │◄─────────────────►│ Service Modules    │   │
│  │  (estable)  │                   │ (plugins)          │   │
│  └──────┬──────┘                   └────────────────────┘   │
│         │ orquesta                                          │
│         ▼                                                   │
│  ┌─────────────┐                                            │
│  │   JARVIS    │ → Agent runtime (privado)                  │
│  └─────────────┘                                            │
└───────────────────────────┬─────────────────────────────────┘
                            │ versión candidata + token
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. PORTAL REVISIÓN  (/r/[token])                           │
│  Entregables · comentarios · cambios · aprobar/rechazar     │
│  Sin agentes · sin prompts · sin datos internos             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Núcleo vs módulos

### 3.1 Núcleo (no se modifica por servicio nuevo)

Responsabilidades estables:

- Identidad y RBAC  
- Catálogo de clientes / leads / proyectos (entidades genéricas)  
- Máquina de estados del ciclo de vida  
- JARVIS orchestration API (asignar, pausar, consolidar)  
- Agent Manager + Tool Registry (contratos)  
- Event Bus + Logger + Memoria + Configuration  
- Review tokens + entregables + deploy adapters (interfaces)  
- API Gateway interno `/api/ops/*` y público mínimo

### 3.2 Módulos / plugins de servicio

Cada oferta de Altivox (web, automatización, chatbot, marketing, contenido, integración, …) es un **módulo** que declara:

- `serviceType` / capacidades  
- plantillas de planificación  
- agentes recomendados  
- herramientas permitidas  
- criterios de QA  
- formato de entregable  
- adapters de deploy opcionales  

El núcleo descubre módulos por registro (manifest), no por `if/else` en el core.

---

## 4. Estado actual del código (as-is)

| Pieza | Estado |
|-------|--------|
| Landing Next.js 16 | Producción |
| Admin HTML `public/*.html` | Producción temporal ≠ `/ops` |
| APIs lead/chat/n8n/site-settings | Producción |
| Supabase leads/clientes/site_settings | Producción |
| `/ops`, proyectos, JARVIS core, `/r/[token]` | **No implementado** |
| Extensión modular formal | **No implementado** |

La auditoría histórica de la landing permanece como contexto en el historial git; el **norte de diseño** es este documento + product-vision.

---

## 5. Arquitectura objetivo (to-be) — capas

```
UI (/ops, /r, pública)
  → API Gateway (pública vs ops vs review)
    → Application services
      → JARVIS (orquestación)
      → Domain (Project, Client, Lead, Delivery, Module)
        → Infrastructure (Supabase, LLM providers, n8n, storage, git/vercel adapters)
```

Carpetas objetivo (Bloque arquitectura de código; no crear aún sin aprobación):

- `src/core` — núcleo OS  
- `src/modules` — plugins de servicio  
- `src/domain` · `src/server` · `src/services` · `src/types` · `src/config`  
- Mantener `src/lib` para utilidades compartidas no de dominio  

---

## 6. Seguridad (resumen)

Ver [`security.md`](./security.md).

- `/ops` y `/api/ops/*`: autenticación + RBAC.  
- `/r/[token]`: autorización por token de revisión de alcance mínimo.  
- Agentes y prompts: nunca en respuestas del portal ni de la web pública.

---

## 7. Documentación relacionada

| Doc | Rol |
|-----|-----|
| [`product-vision.md`](./product-vision.md) | Visión 3–5 años y definición de producto |
| [`flow.md`](./flow.md) | Ciclo de vida oficial |
| [`agents.md`](./agents.md) | JARVIS + agentes privados |
| [`roadmap.md`](./roadmap.md) | Orden de bloques |
| [`database.md`](./database.md) | Modelo de datos as-is / to-be |
| [`api.md`](./api.md) | Contratos HTTP |
| [`MEMORY.md`](./MEMORY.md) | Memoria + ADRs índice |
