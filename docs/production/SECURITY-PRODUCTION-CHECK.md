# SECURITY PRODUCTION CHECK — AltivoxAI OS v0.7.0-b7

**Fecha:** 2026-08-07 · Código: `v0.7.0-b7`  
**Tests:** `npm run test:security` / `test:core` → OK  
Detalle: [`final-security-check.md`](./final-security-check.md) · [`security-audit.md`](./security-audit.md)

---

## Security

| Check | Código | Ops prod |
|-------|--------|----------|
| `can()` deny-by-default | ✅ PASS | [ ] verificar con rol real |
| Roles (admin/operator/jarvis/agent) | ✅ PASS | [ ] `app_metadata.role` en JWT |
| RLS scripts en repo | ✅ PASS | [ ] aplicadas en Supabase |

## Lead API

| Check | Resultado |
|-------|-----------|
| Anon key + RLS (`anon_insert_leads`) | ✅ PASS |
| Sin service_role en `/api/lead` | ✅ PASS |
| Rate limit bucket `lead` | ✅ código |

## Review

| Check | Resultado |
|-------|-----------|
| Portal `/r/[token]` | ✅ |
| Token hasheado; plaintext una vez | ✅ |
| Expiración / revocación | ✅ |
| Sin sesión Ops / cookie staff | ✅ |
| Sin agentes / prompts en vista cliente | ✅ |
| Approve ≠ auto `projects.status` | ✅ |

## Agent Runtime

| Check | Resultado |
|-------|-----------|
| Solo `/api/ops/agents*` · `/api/ops/agent-runs*` | ✅ |
| Sin exposición en `/r` ni web pública | ✅ |
| Techo agent sin review/deploy/admin | ✅ |
| Facade pública `store` (sin leaks `internal/*` externos) | ✅ |

## Deploy

| Check | Resultado |
|-------|-----------|
| Solo Ops `/api/ops/deployments*` | ✅ |
| `can(deploy.*)` | ✅ |
| Sin `/api/public/deploy` | ✅ |
| Sin auto-deploy desde Review | ✅ |
| ZIP interno · sin vendors B7 | ✅ |

---

## Resumen seguridad

| Área | Estado |
|------|--------|
| Auth / can() | OK (código) |
| RLS | OK scripts · aplicación ops pendiente |
| Review aislado | OK |
| Agents privados | OK |
| Deploy protegido | OK |

**Veredicto código:** PASS  
**Veredicto entorno:** PENDING hasta SQL + roles JWT + Upstash confirmados.
