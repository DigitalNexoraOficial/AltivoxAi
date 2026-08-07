# Seguridad — Altivox OS (Bloque 1)

Ver ADR: [`adr/ADR-012-security-foundation.md`](./adr/ADR-012-security-foundation.md)  
Review (contrato): [`adr/ADR-016-bloque-6-review-engine.md`](./adr/ADR-016-bloque-6-review-engine.md)

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
- Agent Runtime (B5): mutaciones vía `can()`; agentes = `principalType: "agent"`; **sin** exposición pública/review

## Operación

1. Ejecutar `audit-events.sql` y `rbac.sql` en Supabase.  
2. Ejecutar `project-engine.sql` (Bloque 2; incluye guards/RPC).  
3. Ejecutar `agent-runtime.sql` (Bloque 5) si el entorno usa agentes.  
4. Ejecutar `assign-superadmin.sql` con tu email.  
5. Logout/login para refrescar JWT.  
6. Configurar Upstash en Vercel (prod).

Notas RBAC (B2 post-auditoría): `operator` y techo `jarvis` incluyen `project.approve` para completar `review → approved` en el camino OPS/orquestación, sin elevar otros permisos.  

## Review Engine (Bloque 6 · ADR-016 · no implementado)

Contrato de seguridad (cuando exista código):

| Superficie | Regla |
|------------|--------|
| Ops | `review.create` · `review.revoke` vía `can()` |
| Portal `/r/[token]` | Auth por **token** seguro; sin sesión staff |
| Frontend | Sin `service_role` |
| Tokens | Revocables + con expiración |
| SEO | `/r` fuera de indexación |
| Aislamiento | Sin agentes, prompts, Memory/Tools internas en el portal |

JARVIS puede solicitar create/revoke como caller; **no** es superadmin (ADR-012).

## Rollback

`rbac-rollback.sql` + revert de deployment.

## Diferido

client_credentials · **review_tokens (B6 código)** · approval_requests UI · Memory Engine completo · Tool Registry de vendors · HITL UI · Deploy (B7).
