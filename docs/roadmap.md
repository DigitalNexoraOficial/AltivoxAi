# Roadmap — Altivox OS

Orden por dependencias. Visión: [`product-vision.md`](./product-vision.md) · Flujo: [`flow.md`](./flow.md)  
B4: [`ADR-014`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md) · B5: [`ADR-015`](./adr/ADR-015-bloque-5-agent-runtime.md) · B6: [`ADR-016`](./adr/ADR-016-bloque-6-review-engine.md) · B7: [`ADR-017`](./adr/ADR-017-bloque-7-deploy-engine.md)

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
| **B6-A** | Sync docs Review Engine | Completado (ADR-016) |
| **6** | Review Engine + `/r/[token]` | **Cerrado** (ADR-016 · Review Engine + portal `/r/[token]`) |
| **B7-A** | Sync docs Deploy Engine | Completado (ADR-017) |
| **7** | Entrega ZIP + Deployment Engine | **Cerrado** (ADR-017 · Deploy Engine + ZIP interno) |

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

## Fase 6 — Review Engine + `/r/[token]` · **cerrada**

**Contrato:** [`ADR-016`](./adr/ADR-016-bloque-6-review-engine.md)

**Implementado:** Review Engine · sesiones + estados propios · tokens hasheados · snapshot deliverables · portal `/r/[token]` (noindex) · APIs `/api/ops/reviews*` + `/api/review/[token]*` · JARVIS `review.create`/`review.revoke` · SQL `review.sql`.

**No es Fase 6:** Deploy · ZIP · hosting · vendors · Workflow runtime · CRM · chat · agentes al cliente · auto-transición PE.

**Nota:** fase PE `review` ≠ sesión/portal Review. Aprobación cliente **no** muta `projects.status`.

---

## Fase 7 — Entrega ZIP + Deployment Engine · **cerrada**

**Contrato:** [`ADR-017`](./adr/ADR-017-bloque-7-deploy-engine.md)

**Implementado:** Deploy Engine · ZIP reproducible interno · estados ADR-017 · `deployments` + `deployment_events` · APIs `/api/ops/deployments*` · JARVIS `deploy.create|execute|cancel|configure` · acciones Security `deploy.*`.

**No es Fase 7:** providers externos · auto-deploy tras Review · portal `/r` · Agent Runtime como deployer · Workflow · CRM · marketplace.

**Nota:** execute termina en `packaged` (sin vendors). PE/Review intactos.

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
