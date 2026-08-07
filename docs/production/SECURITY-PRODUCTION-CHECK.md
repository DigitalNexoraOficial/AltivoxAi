# SECURITY PRODUCTION CHECK — AltivoxAI OS v0.7.0-b7

**Fecha:** 2026-08-07 · Tip docs: smoke live PASS  
**Código tag release:** `v0.7.0-b7`  
**Tests:** `npm run test:security` / `test:core` → OK  

Actualización: distinción **código** vs **entorno live** (smoke owner).

---

## Auth

| | |
|--|--|
| Código (`can()`, roles, deny-by-default) | **OK** |
| JWT / roles en Supabase Auth prod | **OK** (superadmin Ops login) |

## RLS

| | |
|--|--|
| Scripts en `supabase/sql` | **OK** |
| RLS aplicada y verificada en DB prod | **OK** (Ops SQL path + grants) |

## Lead API

| Check | Resultado |
|-------|-----------|
| Anon + RLS (código) | **OK** |
| Sin service_role público (código) | **OK** |
| Insert real en prod | **PENDING** (no parte del smoke Prueba) |

## Review

| Check | Resultado |
|-------|-----------|
| Token-only | **OK** (código + selftest + live `/r`) |
| Expiración / revocación | **OK** (código + selftest; revoke live usado) |
| Sin acceso Ops desde portal | **OK** (código) |
| Portal live `/r/[token]` | **OK** · Vista → Aprobada |

## Agents

| Check | Resultado |
|-------|-----------|
| Privados (ops only) | **OK** |
| No visibles en Review | **OK** |
| Techo sin review/deploy/admin | **OK** |

## Deploy

| Check | Resultado |
|-------|-----------|
| Solo permisos Ops | **OK** |
| Sin `/api/public/deploy` | **OK** |
| Deploy live | **OK** · `packaged` |

---

## Veredicto

**Seguridad código: OK**  
**Seguridad entorno live: OK** (salvo lead insert no ejercitado en este smoke)

Backup formal sigue pendiente antes de declarar **ACTIVE** en el informe de activación.
