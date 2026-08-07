# Roadmap — Altivox OS

Orden por dependencias. Visión: [`product-vision.md`](./product-vision.md) · Flujo: [`flow.md`](./flow.md)  
B4: [`ADR-014`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md) · B5: [`ADR-015`](./adr/ADR-015-bloque-5-agent-runtime.md) · B6: [`ADR-016`](./adr/ADR-016-bloque-6-review-engine.md)

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
| **B5-A** | Sync docs Agent Runtime + módulos | Completado (ADR-015) |
| **5** | Agent runtime + service modules | **Cerrado** (ADR-015) |
| **B6-A** | Sync docs Review Engine | **Completado** (ADR-016) |
| **6** | Review Engine + `/r/[token]` | Pendiente de código (ADR-016 · requiere OK explícito) |
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

## Fase 5 — Agent runtime + service modules · **cerrada**

**Contrato:** [`ADR-015`](./adr/ADR-015-bloque-5-agent-runtime.md)

**Implementado:** Agent Runtime · Agent Manager runtime · módulo `web` · Tool `llm.complete` · Memory/Capability mínimos · JARVIS intenciones agente · APIs `/api/ops/agents*` · `/api/ops/agent-runs*`.

**No es Fase 5:** Review · `/r/[token]` · Deploy · ZIP · Workflow runtime · Tool vendors de entrega · CRM · chat como agente · UI completa de agentes.

---

## Fase 6 — Review Engine + `/r/[token]`

**Contrato:** [`ADR-016`](./adr/ADR-016-bloque-6-review-engine.md) · Prebloque **B6-A completado**.

**Incluye (cuando haya OK de código):** Review Engine independiente · sesiones ligadas a proyecto/versión/deliverables · `review_tokens` · portal `/r/[token]` · comentar / pedir cambios / aprobar / rechazar · APIs review · emisión/revocación Ops (+ JARVIS caller) · persistencia propia · PE solo vía use-cases públicos.

**No es Fase 6:** Deploy · ZIP · hosting · vendors publish · Workflow runtime · CRM · chat público · agentes/prompts/Memory/Tools al cliente · marketplace · reabrir PE/Security/Ops · agente revisor.

**Estado:** **no implementado**. Fase PE `review` ≠ portal cliente.

---

## Fase 7 — Entrega ZIP + Deployment Engine

- Empaquetado / entrega.  
- Deployment Engine **vía Tool Registry** (ampliado; no el mínimo LLM de B5).  
- Consume **únicamente entregables aprobados** (habilitado por B6).

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
