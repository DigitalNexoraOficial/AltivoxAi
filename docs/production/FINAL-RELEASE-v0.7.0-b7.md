# FINAL RELEASE — AltivoxAI OS v0.7.0-b7

**Fecha:** 2026-08-07  
**Tag:** `v0.7.0-b7`  
**Main tip (pre-docs commit):** ver hash tras este documento en el tag  
**Origen merge:** `cursor/release-v0.7.0-b7-4521` → `main` (fast-forward)

---

## Estado

**B0–B7 cerrado** e integrado en `main`.

| Bloque | Contenido |
|--------|-----------|
| B0 | Docs / pivot Altivox OS |
| B1 | Security (`can()`, RLS, audit, rate limit) |
| B2 | Project Engine |
| B3 | Ops Shell `/ops` |
| B4 | JARVIS Core caller |
| B5 | Agent Runtime + módulo web |
| B6 | Review Engine + `/r/[token]` |
| B7 | Deploy Engine + ZIP interno |
| + | Hardening · Production readiness · Go-live docs |

**No B8.** ADR-010…017 vigentes.

---

## Arquitectura

Motores en `src/core/`:

| Motor | Rol |
|-------|-----|
| Security | Autorización / sesión / audit |
| Project Engine | Proyectos · versiones · deliverables · estados |
| Agent Runtime | Runs internos (encapsulado) |
| Review Engine | Validación cliente token-only |
| Deploy Engine | Empaquetado ZIP · sin vendors |

JARVIS = orquestador/caller. Ops = superficie staff. `/r` = cliente.

---

## Seguridad

| Control | Estado |
|---------|--------|
| Review aislado por token | ✅ |
| Agent Runtime privado (ops) | ✅ |
| Deploy separado (no auto desde Review) | ✅ |
| Lead API anon + RLS | ✅ |
| `service_role` solo servidor | ✅ |
| Legacy HTML en `public/legacy/` | ✅ |

---

## Tests (post-merge en `main`)

| Suite | Resultado |
|-------|-----------|
| test:security | ok |
| test:project-engine | ok |
| test:jarvis | ok |
| test:engines-contracts | ok |
| test:agent-runtime | ok |
| test:review-engine | ok |
| test:deploy-engine | ok |
| **test:core** | **PASS** |

---

## Producción pendiente (ops)

Solo configuración / validación de entorno:

1. Variables entorno (sin `ALTIVOX_*_STORE=memory`)  
2. Migraciones Supabase B1–B7 (runbook manual)  
3. Upstash rate limit  
4. Backup Supabase  
5. Smoke HTTP E2E  

Ver: [`go-live-env-check.md`](./go-live-env-check.md) · [`go-live-supabase-runbook.md`](./go-live-supabase-runbook.md) · [`smoke-test.md`](./smoke-test.md)
