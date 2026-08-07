# Go-live — comprobación SQL producción

Orden canónico: [`sql-checklist.md`](./sql-checklist.md)

**Agente:** no puede aplicar ni verificar el proyecto Supabase de prod. Rellenar fechas/entorno en ops.

---

## Orden de aplicación

| # | Script | Aplicada | Fecha | Entorno | Rollback disponible |
|---|--------|----------|-------|---------|---------------------|
| 1 | Foundation (`leads` + `clientes.sql` + `site-settings.sql`) | [ ] | | prod / staging | Parcial (sin script dedicado) |
| 2 | `audit-events.sql` | [ ] | | | No dedicado |
| 3 | `rbac.sql` | [ ] | | | `rbac-rollback.sql` ⚠️ abre policies |
| 4 | `assign-superadmin.sql` (email real) | [ ] | | | No |
| 5 | `project-engine.sql` | [ ] | | | `project-engine-rollback.sql` |
| 6 | `agent-runtime.sql` | [ ] | | | `agent-runtime-rollback.sql` |
| 7 | `review.sql` | [ ] | | | `review-rollback.sql` |
| 8 | `deploy.sql` | [ ] | | | `deploy-rollback.sql` |

**No re-aplicar** tras `rbac.sql`: `auth-admin-only.sql`, `clientes.sql`, `site-settings.sql` (riesgo OR de policies abiertas).

---

## Confirmaciones post-migrate

| Check | Ops |
|-------|-----|
| RLS activo en leads, clientes, site_settings, audit_events | [ ] |
| RLS activo en projects* / deliverables / project_events | [ ] |
| RLS activo en agents / agent_runs / agent_run_facts | [ ] |
| RLS activo en reviews* / review_tokens* | [ ] |
| RLS activo en deployments / deployment_events | [ ] |
| Anon: insert leads OK; select leads DENY | [ ] |
| Anon: sin acceso PE / Review / Deploy / Agents | [ ] |

---

## Separación de motores (sin tablas mezcladas)

| Motor | Tablas propias | FK cruzada a otro motor |
|-------|----------------|-------------------------|
| Project Engine | `projects`, `project_versions`, `deliverables`, `project_events` | `client_id` → `clientes` (CRM) |
| Agent Runtime | `agents`, `agent_runs`, `agent_run_facts` | `project_id` opcional (uuid, **sin FK** a projects) |
| Review Engine | `reviews`, `review_tokens`, `review_deliverables`, `review_comments`, `review_events` | `project_id`/`version_id` lógicos (**sin FK** PE) |
| Deploy Engine | `deployments`, `deployment_events` | ids lógicos (**sin FK** PE/Review) |

✅ Diseño código/SQL: motores **independientes** (ADR-013…017).  
[ ] Ops: confirmar en DB que no se añadieron FKs cruzadas ad-hoc.

---

## Resultado fase 2

| Dimensión | Resultado |
|-----------|----------|
| Scripts en repo + orden | **PASS** |
| Aplicación en Supabase prod | **PENDING_OPS** |
