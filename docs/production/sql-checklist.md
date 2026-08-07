# SQL checklist — producción (B1–B7)

**Auditoría P0 · 2026-08-07**  
Scripts en `supabase/sql/`. Autorización de dominio = TypeScript `can()`; SQL = tablas + RLS defensa en profundidad.

---

## Orden de ejecución (producción)

| # | Migración | Bloque | Estado código | Dependencias | Rollback | Validado (código) |
|---|-----------|--------|---------------|--------------|----------|-------------------|
| 0a | Tabla `leads` (fuera de repo / ya en Supabase) | Pre | Prerrequisito | — | — | Ops entorno |
| 0b | `clientes.sql` | Pre / CRM | Listo | `pgcrypto` | **No** dedicado | Ops |
| 0c | `site-settings.sql` | Pre / web | Listo | `pgcrypto` | **No** dedicado | Ops |
| 0d | `auth-admin-only.sql` | Pre opcional | **Solo si faltan columnas lead** | Tabla `leads` | **No** | ⚠️ Nunca **después** de `rbac.sql` |
| 0e | `n8n.sql` | Pre opcional | Listo | — | **No** | ⚠️ RLS abierta a authenticated |
| 1 | `audit-events.sql` | **B1** | Listo | `pgcrypto` | **No** dedicado | ✅ script |
| 2 | `rbac.sql` | **B1** | Listo | `leads`, `clientes`, `site_settings` | `rbac-rollback.sql` | ✅ script |
| 3 | `assign-superadmin.sql` | **B1** ops | Listo | Usuario Auth real | **No** | Sustituir email + logout/login |
| 4 | `project-engine.sql` | **B2** | Listo | Helpers B1 · `clientes` | `project-engine-rollback.sql` | ✅ script |
| — | *(sin SQL)* | B3 Ops · B4 JARVIS | — | — | — | — |
| 5 | `agent-runtime.sql` | **B5** | Listo | Helpers B1 | `agent-runtime-rollback.sql` | ✅ script |
| 6 | `review.sql` | **B6** | Listo | Helpers B1 | `review-rollback.sql` | ✅ script |
| 7 | `deploy.sql` | **B7** | Listo | Helpers B1 | `deploy-rollback.sql` | ✅ script |

**Camino mínimo** (si foundation ya vive y está endurecida):

```
audit-events.sql → rbac.sql → assign-superadmin.sql
→ project-engine.sql → agent-runtime.sql → review.sql → deploy.sql
```

---

## Inventario por bloque

| Migración | Tablas / objetos | RLS | Rollback | Validado |
|-----------|------------------|-----|----------|---------|
| `audit-events.sql` | `audit_events` | ON · revoke anon/auth · solo `service_role` | — | ✅ |
| `rbac.sql` | Fns `altivox_*` · policies leads/clientes/site_settings | anon insert leads; staff resto | `rbac-rollback.sql` | ✅ |
| `project-engine.sql` | `projects`, `project_versions`, `deliverables`, `project_events` + RPCs | Staff · revoke anon · RPC → service_role | `project-engine-rollback.sql` | ✅ |
| `agent-runtime.sql` | `agents`, `agent_runs`, `agent_run_facts` | Staff FOR ALL | `agent-runtime-rollback.sql` | ✅ (sin REVOKE anon explícito; RLS deniega sin policy) |
| `review.sql` | `reviews`, `review_tokens`, `review_deliverables`, `review_comments`, `review_events` | Staff · revoke anon · portal vía service_role en app | `review-rollback.sql` | ✅ |
| `deploy.sql` | `deployments`, `deployment_events` | Staff · revoke anon | `deploy-rollback.sql` | ✅ |

---

## Prohibiciones ops

1. **No** re-ejecutar `auth-admin-only.sql`, `clientes.sql` o `site-settings.sql` **después** de `rbac.sql` (recrean policies abiertas; RLS hace OR → fuga authenticated).  
2. **No** aplicar `*-rollback.sql` en migrate forward.  
3. `assign-superadmin.sql`: sustituir `TU_EMAIL@dominio.com` por email real.  
4. Tras cambiar `app_metadata.role`: logout/login para refrescar JWT.

---

## Checklist validación post-migrate (entorno)

- [ ] `select tablename from pg_tables where schemaname='public'` incluye tablas B1–B7  
- [ ] RLS enabled en leads, clientes, site_settings, audit_events, PE, agents*, reviews*, deployments*  
- [ ] Anon **no** puede `select` leads (solo insert)  
- [ ] Anon **no** puede leer `reviews` / `deployments` / `projects`  
- [ ] Staff JWT con rol correcto pasa smoke `/ops`  
- [ ] Scripts rollback presentes en repo (no ejecutados)

---

## Estado auditoría

| Área | Estado | Observaciones |
|------|--------|---------------|
| Orden B1–B7 | ✅ Documentado | Foundation antes de rbac |
| Rollback B2/B5/B6/B7 + rbac | ✅ | audit-events / foundation sin rollback dedicado |
| Conflicto legacy | ⚠️ | `auth-admin-only` post-rbac = riesgo crítico ops |
| Validado en este agente | Código/scripts | **Aplicación real = checklist entorno** |
