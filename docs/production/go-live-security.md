# Go-live — security final check

**Ejecutado:** `npm run test:security` → **ok** (2026-08-07)  
Detalle P0: [`security-audit.md`](./security-audit.md)

---

## Roles

| Principal | Resultado código | Notas |
|-----------|------------------|-------|
| `admin` | ✅ | Ops + configure agents/deploy + review |
| `operator` | ✅ | PE transition/approve · agent execute · review.create · deploy create/execute/cancel |
| `jarvis` | ✅ | Caller techo: PE + agent execute/stop + review create/revoke + deploy create/execute/cancel · **no** superadmin · **no** `deploy.configure` / `deploy.production` |
| `agent` | ✅ | Techo: `project.read`, `tool.execute`, `credentials.use`, `deliverable.generate` · **sin** review/deploy/admin/ops |

`can()` = deny-by-default · bags explícitas · allowlist ∩ ceiling.

---

## Portal Review (`/r/[token]` · `/api/review/*`)

| Check | Resultado |
|-------|-----------|
| Acceso solo por token (hash SHA-256) | ✅ PASS |
| Sin sesión Ops / cookie staff | ✅ PASS |
| Sin `service_role` en rutas review | ✅ PASS (sin matches) |
| Sin datos internos (prompts/agentes/ops) | ✅ sanitize + selftest |
| Approve **no** llama `transitionProject` | ✅ PASS (use-cases sin PE transition) |

---

## Agents

| Check | Resultado |
|-------|-----------|
| No admin / role.manage | ✅ |
| No Review (`review.*`) | ✅ |
| No Deploy (`deploy.*`) | ✅ |
| Sin bypass `can()` | ✅ use-cases + ceiling |

---

## APIs

| Superficie | Auth | Resultado |
|------------|------|-----------|
| `/api/ops/*` | Middleware + `resolveOpsUser` + `can()` | ✅ |
| `/api/ops/deployments*` | Ops (no existe `/api/deploy/*` — correcto ADR-017) | ✅ |
| `/api/review/*` | Token only | ✅ |
| `/api/lead` | Anon + RLS · rate limit | ✅ |
| `/api/public/deploy` | **No existe** (prohibido) | ✅ |

---

## Logs sensibles (muestra código)

| Ruta | Qué loguea | Secretos |
|------|------------|----------|
| lead / chat / n8n | `code` / `message` genérico | ✅ no tokens/keys |
| review `_shared` | comentario “Never log the token” | ✅ |
| audit metadata | strip password/token/apikey | ✅ |

---

## SEO

| Superficie | Control | Resultado |
|------------|---------|-----------|
| `/r/[token]` | layout `robots: noindex` | ✅ |
| `/legacy/` | robots.txt Disallow | ✅ |
| `/ops` | noindex + disallow | ✅ |

---

## Resultado fase 3

**PASS** (código + selftests).  
Ops residual: Upstash, roles staff en JWT, no re-aplicar SQL legacy.
