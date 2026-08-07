# ADR-013 — Project Engine (Bloque 2 · recorte de dominio)

- **Estado:** Aceptado (documentación Prebloque B2-A)  
- **Fecha:** 2026-08-07  
- **Decisores:** Owner (Xabier) · sync arquitectura

---

## Contexto

ADR-011 define cinco motores. El Bloque 2 implementará **solo** el Project Engine, y solo un **recorte** usable sin agentes, review portal ni Tool Registry.

Había divergencia: `core-engines.md` / `flow.md` asignaban al PE tokens de review y deployments **ya**. El plan B2 aprobado los difiere.

## Decisión

1. Project Engine B2 incluye únicamente: **Project**, **ProjectVersion**, **Deliverable**, **ProjectEvent**.  
2. Estados: `draft|planning|in_progress|qa|review|approved|delivered|maintenance|cancelled|archived`.  
3. `review` = fase de estado; **sin** `review_tokens` / comments / `/api/review` / portal.  
4. **Sin** `deployments` ni APIs de deploy.  
5. **Sin** `required_capabilities` en el proyecto — solo `service_type`.  
6. Transiciones del ciclo, mientras no existan Workflow/JARVIS/agentes, son **manuales vía OPS** (`can` + APIs del PE).  
7. `project_events` = dominio; `audit_events` = técnico (ADR-012).  
8. APIs previstas (implementación posterior a este ADR):  
   `POST/GET /api/ops/projects`, `GET/PATCH .../[id]`, `POST .../transition`, `.../versions`, `.../deliverables`, `GET .../timeline`.

## Consecuencias

- Docs y plan B2 quedan alineados (Prebloque B2-A).  
- Review Engine y Deployment Engine se apoyarán en PE después.  
- JARVIS será caller del mismo contrato de use-cases.

## No implica

Este ADR **no** autoriza por sí solo a crear tablas/APIs; autoriza el **alcance documental**. La implementación de código es un paso aparte tras OK explícito.

## Referencias

- [`core-engines.md`](../core-engines.md)  
- [`flow.md`](../flow.md)  
- [`database.md`](../database.md)  
- [`adr/ADR-011-core-engines.md`](./ADR-011-core-engines.md)  
- [`adr/ADR-012-security-foundation.md`](./ADR-012-security-foundation.md)
