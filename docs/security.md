# Seguridad — Altivox OS (Bloque 1)

Ver ADR: [`adr/ADR-012-security-foundation.md`](./adr/ADR-012-security-foundation.md)

## Implementado

- `can(subject, action, resource)` — `src/core/security`
- Roles/permisos en TypeScript (sin grants DB)
- RLS: `supabase/sql/rbac.sql`
- Audit: `supabase/sql/audit-events.sql` + `writeAuditEvent`
- Middleware: `src/middleware.ts` — cookie `altivox_ops_token` es **solo transporte** del access token de Supabase; la verdad es `/auth/v1/user` + `can(ops.access)`
- Rate limit: Upstash (`RATE_LIMIT_MODE`, `UPSTASH_*`)
- `/api/n8n` exige secret **o** humano con `n8n.emit` / `n8n.write_crm`
- `GET /api/site-settings` solo anon key
- `POST /api/ops/site-settings` — `can(settings.write)` + escritura con JWT del usuario (RLS), sin service_role

## Operación

1. Ejecutar `audit-events.sql` y `rbac.sql` en Supabase.  
2. Ejecutar `project-engine.sql` (Bloque 2; incluye guards/RPC).  
3. Ejecutar `assign-superadmin.sql` con tu email.  
4. Logout/login para refrescar JWT.  
5. Configurar Upstash en Vercel (prod).

Notas RBAC (B2 post-auditoría): `operator` y techo `jarvis` incluyen `project.approve` para completar `review → approved` en el camino OPS/orquestación, sin elevar otros permisos.  

## Rollback

`rbac-rollback.sql` + revert de deployment.

## Diferido

client_credentials · review_tokens · approval_requests · Memory Engine · Tool Registry runtime · HITL UI.
