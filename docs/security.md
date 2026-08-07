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
4. Ejecutar `review.sql` (Bloque 6).  
5. Ejecutar `assign-superadmin.sql` con tu email.  
6. Logout/login para refrescar JWT.  
7. Configurar Upstash en Vercel (prod).

Notas RBAC (B2 post-auditoría): `operator` y techo `jarvis` incluyen `project.approve` para completar `review → approved` en el camino OPS/orquestación, sin elevar otros permisos.  

## Review Engine (Bloque 6 · ADR-016 · implementado)

| Superficie | Regla |
|------------|--------|
| Ops | `review.create` · `review.revoke` vía `can()` |
| Portal `/api/review/*` + `/r/[token]` | Auth por **token** (hash SHA-256 en DB); sin sesión staff |
| Frontend | Sin `service_role` |
| Tokens | Revocables + con expiración; plaintext solo una vez al crear |
| SEO | `/r` `noindex` + disallow en `robots.txt` |
| Aislamiento | Sin agentes, prompts, Memory/Tools en el portal |
| Rate limit | bucket `review` |

JARVIS techo incluye `review.create` + `review.revoke`; **no** es superadmin (ADR-012).

## Deploy Engine (Bloque 7 · ADR-017 · no implementado)

Contrato de seguridad (cuando exista código):

| Superficie | Regla |
|------------|--------|
| Ops | `deploy.preview` · `deploy.production` vía `can()` |
| Publish | Confirmación humana obligatoria antes de producción |
| Frontend | Sin `service_role` |
| Cliente `/r` | Sin APIs de deploy |
| JARVIS | Caller; techo actual permite `deploy.preview`, **no** `deploy.production` |
| Aislamiento | Agent Runtime no publica; sin prompts/runs en respuestas deploy |

## Rollback

`rbac-rollback.sql` + revert de deployment.

## Diferido

client_credentials · approval_requests UI · Memory Engine completo · Tool Registry de vendors (hasta B7 código) · HITL UI · **Deploy Engine código (B7)**.
