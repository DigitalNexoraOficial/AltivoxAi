# FINAL ENV VALIDATION — AltivoxAI OS v0.7.0-b7

**Fecha:** 2026-08-07  
**Método:** evidencia comportamental en producción (owner) + reglas de código  
**Referencia:** [`ENV-ACTIVATION-CHECK.md`](./ENV-ACTIVATION-CHECK.md)

---

## Resultado

**PASS (inferido por smoke live)** · el agente no lee el dashboard Vercel; la prueba es HTTP real en `www.altivoxai.es`.

---

## Supabase (checklist owner)

| Variable | Regla | Verificado aquí | Ops |
|----------|-------|-----------------|-----|
| `SUPABASE_URL` | Obligatoria | Smoke PE/Review/Deploy SQL | [x] |
| `SUPABASE_ANON_KEY` | Lead + RLS | Login Auth + Ops | [x] |
| `SUPABASE_SERVICE_ROLE_KEY` | **Solo backend** · nunca `NEXT_PUBLIC_` | Persistencia reviews/deployments | [x] |

Código (garantía): `/api/lead` usa solo anon (`supabaseAnonKey`) — PASS en código.

---

## Upstash

| Variable | Verificado aquí | Ops |
|----------|-----------------|-----|
| `UPSTASH_REDIS_REST_URL` | 429 `rl:login` en `/api/ops/session` (fail-open no aplica: limitó) | [x] |
| `UPSTASH_REDIS_REST_TOKEN` | idem | [x] |

---

## Stores

| Check | Verificado aquí | Ops |
|-------|-----------------|-----|
| NO `ALTIVOX_*_STORE=memory` en prod | Reviews/deployments persistieron entre requests | [x] |
| Persistencia SQL vía service_role sin memory | Deploy `packaged` + reviews listados | [x] |

`.env.example` sigue mostrando `memory` como plantilla **local** — no copiar a Vercel.

---

## Veredicto Fase 1

| | |
|--|--|
| Código / reglas | PASS |
| Env producción real | **PASS** (evidencia smoke 2026-08-07) |
| ¿BLOCKED por variable faltante demostrada? | No |

Listo para ACTIVE **salvo** backup formal (ver [`BACKUP-EXECUTION.md`](./BACKUP-EXECUTION.md)).
