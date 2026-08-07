# SECURITY PRODUCTION CHECK — AltivoxAI OS v0.7.0-b7

**Fecha:** 2026-08-07 · Tip docs: activation final check  
**Código tag release:** `v0.7.0-b7`  
**Tests:** `npm run test:security` / `test:core` → OK  

Actualización final: distinción **código** vs **entorno live**.

---

## Auth

| | |
|--|--|
| Código (`can()`, roles, deny-by-default) | **OK** |
| JWT / roles en Supabase Auth prod | **PENDING** (ops) |

## RLS

| | |
|--|--|
| Scripts en `supabase/sql` | **OK** |
| RLS aplicada y verificada en DB prod | **PENDING** |

## Lead API

| Check | Resultado |
|-------|-----------|
| Anon + RLS (código) | **OK** |
| Sin service_role público (código) | **OK** |
| Insert real en prod | **PENDING** |

## Review

| Check | Resultado |
|-------|-----------|
| Token-only | **OK** (código + selftest) |
| Expiración / revocación | **OK** (código + selftest) |
| Sin acceso Ops desde portal | **OK** (código) |
| Portal live `/r/[token]` | **PENDING** HTTP |

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
| Deploy live | **PENDING** HTTP |

---

## Veredicto

**Seguridad código: OK**  
**Seguridad entorno live: PENDING**

No se declara producción ACTIVE solo por seguridad de código.
