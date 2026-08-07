# ADR-013 — Project Engine (Bloque 2 · recorte de dominio)

- **Estado:** Aceptado · **implementado en código** (rama Bloque 2)  
- **Fecha:** 2026-08-07 (docs) · implementación 2026-08  
- **Decisores:** Owner (Xabier)

---

## Contexto

ADR-011 define cinco motores. El Bloque 2 implementa **solo** el Project Engine, y solo un **recorte** usable sin agentes, review portal ni Tool Registry.

## Decisión

1. Project Engine B2 incluye únicamente: **Project**, **ProjectVersion**, **Deliverable**, **ProjectEvent**.  
2. Estados: `draft|planning|in_progress|qa|review|approved|delivered|maintenance|cancelled|archived`.  
3. `review` = fase de estado; **sin** `review_tokens` / comments / `/api/review` / portal.  
4. **Sin** `deployments` ni APIs de deploy.  
5. **Sin** `required_capabilities` en el proyecto — solo `service_type`.  
6. Transiciones del ciclo, mientras no existan Workflow/JARVIS/agentes, son **manuales vía OPS** (`can` + APIs del PE).  
7. `project_events` = dominio; `audit_events` = técnico (ADR-012).  
8. APIs:  
   `POST/GET /api/ops/projects`, `GET/PATCH .../[id]`, `POST .../transition`, `.../versions`, `.../deliverables`, `GET .../timeline`.

## Implementación (código)

| Pieza | Ubicación |
|-------|-----------|
| Módulo | `src/core/project-engine/` |
| Use-cases | `createProject`, `listProjects`, `getProject`, `updateProjectMeta`, `transitionProject`, `createVersion`, `registerDeliverable`, `listTimeline` |
| SQL | `supabase/sql/project-engine.sql` · rollback `project-engine-rollback.sql` |
| Authz | Toda mutación vía `can(subject, action, resource)` en use-cases; Route Handlers revalidan sesión |

### Transiciones

- Camino feliz: un paso adelante.  
- `cancelled` desde cualquier estado salvo `cancelled`/`archived`.  
- `archived` desde `cancelled` \| `delivered` \| `maintenance`.  
- Entrar en `approved` exige permiso `project.approve` (resto: `project.transition`).

## Consecuencias

- JARVIS podrá llamar los mismos use-cases sin mutar el núcleo.  
- Review Engine y Deployment Engine se apoyarán en PE después.

## Fuera de alcance (confirmado)

Review Engine · Deployment Engine · Capability Registry · Workflow Engine · Tool Registry · Memory Engine · Agent Runtime · `/api/review` · tablas de tokens/deploys/capabilities/agents/memory/tools.

## Referencias

- [`core-engines.md`](../core-engines.md)  
- [`flow.md`](../flow.md)  
- [`database.md`](../database.md)  
- [`api.md`](../api.md)  
- [`adr/ADR-012-security-foundation.md`](./ADR-012-security-foundation.md)
