# ADR-012 — Security foundation (Bloque 1)

- **Estado:** Aceptado / implementado en código  
- **Fecha:** 2026-08-07

## Decisión

1. Permission catalog, roles y mapeo rol→permisos en **TypeScript** (`src/core/security`). Sin tabla `permission_grants`.  
2. API `can(subject, action, resource)` deny-by-default; roles **sin herencia**.  
3. Roles humanos: `superadmin|admin|editor|operator|viewer` en `app_metadata.role`.  
4. Identidades máquina documentadas + ceilings en TS; n8n secret → `integration:n8n`.  
5. RLS real en leads/clientes/site_settings (SQL `rbac.sql`).  
6. Middleware + cookie `altivox_ops_token` para HTML admin y `/ops`.  
7. Rate limit Upstash (memory solo non-prod / fallback explícito).  
8. `audit_events` solo para operaciones actuales.  
9. Sin tablas credentials / review_tokens / approvals en este bloque.  
10. JARVIS ≠ superadmin (ceiling en `MACHINE_PERMISSION_CEILINGS`).

## Cadena futura (doc)

Capability Registry → Tool Registry → Adapter → servicio externo.

## Rollback

`supabase/sql/rbac-rollback.sql` + revert deploy.
