# Seguridad — Altivox OS (Bloque 1)

Ver ADR: [`adr/ADR-012-security-foundation.md`](./adr/ADR-012-security-foundation.md)

## Implementado

- `can(subject, action, resource)` — `src/core/security`
- Roles/permisos en TypeScript (sin grants DB)
- RLS: `supabase/sql/rbac.sql`
- Audit: `supabase/sql/audit-events.sql` + `writeAuditEvent`
- Middleware: `src/middleware.ts` + cookie ops session
- Rate limit: Upstash (`RATE_LIMIT_MODE`, `UPSTASH_*`)
- `/api/n8n` exige secret **o** humano con `n8n.emit` / `n8n.write_crm`
- `GET /api/site-settings` solo anon key

## Operación

1. Ejecutar `audit-events.sql` y `rbac.sql` en Supabase.  
2. Ejecutar `assign-superadmin.sql` con tu email.  
3. Logout/login para refrescar JWT.  
4. Configurar Upstash en Vercel (prod).  

## Rollback

`rbac-rollback.sql` + revert de deployment.

## Diferido

client_credentials · review_tokens · approval_requests · Memory Engine · Tool Registry runtime · HITL UI.
