# Arquitectura — Altivox OS

**Producto:** Altivox OS — Sistema Operativo interno de Altivox AI  
**Escaparate:** web pública https://www.altivoxai.es  
**Visión oficial:** [`product-vision.md`](./product-vision.md)  
**ADRs:** [`ADR-010`](./adr/ADR-010-altivox-os-pivot.md) · [`ADR-011`](./adr/ADR-011-core-engines.md)  
**Motores del núcleo:** [`core-engines.md`](./core-engines.md)  
**Actualizado:** 2026-08-07 · Bloque 0 (+ motores)

---

## 1. Principios

1. **Tres superficies** — pública / `/ops` / `/r/[token]`. Nunca mezclar concerns.  
2. **Núcleo estable** — añadir servicios solo como **módulos/plugins** vía interfaces.  
3. **JARVIS orquesta** — no ejecuta entrega; no crea proyectos directo; usa Project Engine + Workflow Engine + Capability Registry.  
4. **Agentes privados** — solo OS; I/O solo vía Tool Registry; memoria solo vía Memory Engine.  
5. **Capabilities antes que agentes** — los proyectos declaran capacidades; JARVIS elige agentes.  
6. **Ciclo de vida único** — [`flow.md`](./flow.md).  
7. **Autorización en servidor** — RBAC + RLS.  
8. **Registro total** — auditado en Memory Engine / event log.  
9. **Clean Architecture / SOLID / DRY / KISS** — TypeScript estricto.

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
│   (orquesta)         (plugins)         (privado)            │
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

**Motores oficiales** (detalle: [`core-engines.md`](./core-engines.md)):

| Motor | Dueño de |
|-------|----------|
| **Project Engine** | Crear proyectos, estados, versiones, entregables, revisiones, despliegues |
| **Workflow Engine** | Definir/ejecutar procesos reutilizables (independiente de JARVIS) |
| **Tool Registry** | Único acceso a GitHub, Vercel, Supabase, n8n, LLMs, WP, FTP, APIs… |
| **Memory Engine** | Memoria central única; sin silos críticos en agentes |
| **Capability Registry** | Capabilities de proyecto → resolución a agentes (vía JARVIS) |

Además: Identidad/RBAC · Agent Manager · Event Bus · Logger · Configuration · API Gateway `/api/ops/*`.

JARVIS es **orquestador caller**, no el almacén de proyectos ni el bus de I/O.

### 3.2 Módulos / plugins de servicio

Cada oferta de Altivox es un **módulo** que declara:

- `serviceType`  
- **capabilities** tipicas (no agent IDs fijos)  
- plantillas de workflow / planificación  
- tools permitidos (ids del Tool Registry)  
- criterios de QA · formato de entregable · adapters de deploy  

Descubrimiento por manifest; cero `if/else` de servicio en el core.

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
  → API Gateway
    → JARVIS (orquestación) + Application services
      → Project Engine · Workflow Engine · Capability Registry
      → Agent Manager → agents
      → Memory Engine
      → Tool Registry → adapters (GitHub, Vercel, LLMs, n8n, …)
      → Domain entities (Client, Lead, Module manifests)
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
| [`product-vision.md`](./product-vision.md) | Visión 3–5 años |
| [`core-engines.md`](./core-engines.md) | Cinco motores del núcleo |
| [`flow.md`](./flow.md) | Ciclo de vida oficial |
| [`agents.md`](./agents.md) | JARVIS + agentes privados |
| [`roadmap.md`](./roadmap.md) | Orden de bloques |
| [`database.md`](./database.md) | Modelo as-is / to-be |
| [`api.md`](./api.md) | Contratos HTTP |
| [`MEMORY.md`](./MEMORY.md) | Memoria humana + ADRs |
