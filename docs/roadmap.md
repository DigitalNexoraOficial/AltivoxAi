# Roadmap — Altivox OS

Orden por dependencias. Visión: [`product-vision.md`](./product-vision.md) · Flujo: [`flow.md`](./flow.md)  
B4: [`ADR-014`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md) · B5: [`ADR-015`](./adr/ADR-015-bloque-5-agent-runtime.md)

---

## Estado de bloques

| Bloque | Nombre | Estado |
|--------|--------|--------|
| **0** | Docs Altivox OS | Completado |
| **1** | Seguridad | Completado (código; ops SQL/Upstash en entorno) |
| **B2-A** | Sync docs PE recorte | Completado |
| **2** | Project Engine | **Cerrado** (ADR-013) |
| **3** | Shell `/ops` App Router | **Cerrado** |
| **B4-A** | Sync docs JARVIS + motores (interfaces) | Completado (ADR-014) |
| **4** | JARVIS + resto de motores (interfaces) | **Cerrado** (ADR-014) |
| **B5-A** | Sync docs Agent Runtime + módulos | **Completado** (ADR-015) |
| **5** | Agent runtime + service modules | Pendiente de **aprobación de implementación** |
| **6** | Review Engine + `/r/[token]` | Pendiente (después de B5) |
| **7** | Entrega ZIP + Deployment Engine | Pendiente (después de B6) |

---

## Fase 2 — Project Engine (cerrada)

**Solo:** `projects`, `project_versions`, `deliverables`, `project_events`  
APIs `/api/ops/projects*` · sin review/deploy/capabilities/agents.

---

## Fase 3 — Ops Shell (cerrada)

- `src/app/ops` — layout, dashboard, nav, sesión/logout  
- Proyectos UI → solo APIs B2  
- CRM / Clientes / Ajustes → enlaces HTML (ADR-001)  
- `noindex` en `/ops`

---

## Fase 4 — JARVIS + resto de motores (interfaces) · **cerrada**

**Contrato:** [`ADR-014`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md)

- **JARVIS Core** — orquestador/caller → PE.  
- Fronteras TypeScript de motores + Agent Manager boundary.  
- Sin Agent Runtime ni service modules.

---

## Fase 5 — Agent runtime + service modules

**Contrato:** [`ADR-015`](./adr/ADR-015-bloque-5-agent-runtime.md)

**Incluye (recorte):** Agent Runtime · Agent Manager runtime · un primer service module · integración JARVIS · Tool/Memory/Capability **mínimos** según ADR-015.

**No es Fase 5:** Review · `/r/[token]` · Deploy · ZIP · Workflow runtime · Tool Registry de vendors de entrega · CRM · chat como agente.

*Implementación de código: solo tras OK explícito. B5-A solo sincronizó docs.*

---

## Fase 6 — Review Engine + `/r/[token]`

- Tokens de revisión, comentarios, portal cliente.  
- Sin agentes/prompts/credenciales en el portal.

---

## Fase 7 — Entrega ZIP + Deployment Engine

- Empaquetado / entrega.  
- Deployment Engine **vía Tool Registry** (ampliado; no el mínimo LLM de B5).

---

## Fases posteriores (resumen)

8. Perf/SEO escaparate  
9. Analítica / facturación  
(+ migración CRM HTML → App Router cuando toque)

Detalle motors: [`core-engines.md`](./core-engines.md).

---

## Principios

- Un bloque cada vez; docs = verdad; `can()` en mutaciones ops.  
- No anticipar tablas/APIs fuera del ADR del bloque.  
- No stubs ni simulaciones de motores.
