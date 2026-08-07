# Security audit P0 — post B0–B7

**Fecha:** 2026-08-07 · **Alcance:** código en repo (sin cambios de arquitectura).  
Ejecutar: `npm run test:security` · `npm run test:core`.

---

## Scorecard

| # | Check | Resultado |
|---|--------|-----------|
| 1 | `can()` deny-by-default · bags explícitas | **PASS** |
| 2 | Ops: project / agent / review / deploy actions + middleware | **PASS** |
| 3 | Review cliente: solo token · sin cookie staff · sin `/api/ops` | **PASS** |
| 4 | Agentes: sin review · sin deploy · sin admin · techo machine | **PASS** |
| 5 | Lead: anon + RLS · sin `service_role` | **PASS** |
| 6 | `service_role` solo stores/audit/n8n server | **PASS** |
| 7 | Secrets: sin service_role en `public/` | **PASS** |
| 8 | SEO `/r` noindex · robots `/r` + `/legacy` | **PASS** |
| 9 | Resource-scoped `can(resource)` | **WARN** (diferido B1; no bloquea cierre) |
| 10 | Upstash obligatorio en prod | **WARN** ops config |

**FAIL:** ninguno en superficies auditadas.

---

## Ops — acciones clave

| Dominio | Acciones | Notas |
|---------|----------|-------|
| Project | create/read/update/delete/approve/transition | PE dueño |
| Agent | execute/stop/configure | Runtime interno |
| Review | create/revoke | Ops; portal = token |
| Deploy | create/execute/cancel/configure (+ preview/production históricos) | ZIP; sin vendors |

Middleware protege HTML CRM, `/legacy/*` cosmético, `/ops`, `/api/ops/*` (excepto session bootstrap).

---

## Cliente Review

- Auth: hash SHA-256 del token → `review_tokens`.  
- Rutas: `/api/review/[token]*` · UI `/r/[token]`.  
- Sin `OPS_COOKIE`, sin elevación staff.  
- Approve **no** llama `transitionProject` (selftest + código).

---

## Agentes

Techo `principalType: agent`: `project.read`, `tool.execute`, `credentials.use`, `deliverable.generate`.  
Runtime estrecha allowlist a `tool.execute` + `project.read`.  
Selftests Review/Deploy niegan subject agent.

---

## service_role

| Path | ¿service_role? | OK |
|------|----------------|----|
| `/api/lead` | No (anon) | ✅ |
| Engines SQL stores | Sí tras `can()` | ✅ |
| `audit.ts` | Sí | ✅ |
| `/api/n8n` | Sí tras secret/staff | ✅ |
| Frontend / legacy | No | ✅ |

---

## Riesgos residuales (ops)

1. Re-aplicar `auth-admin-only.sql` / foundation tras `rbac.sql`.  
2. Prod sin Upstash → rate limit fail-close.  
3. `ALTIVOX_*_STORE=memory` en Vercel → sin persistencia.  
4. Autorización por recurso (multi-tenant fino) aún no en `can()`.
