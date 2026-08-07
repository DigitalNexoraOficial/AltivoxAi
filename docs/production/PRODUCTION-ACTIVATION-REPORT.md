# AltivoxAI OS v0.7.0-b7

**Informe:** Production Activation Final Check  
**Fecha:** 2026-08-07  
**Operador smoke:** Xabier  
**Main tip:** post-merge fixes review/login/deploy · **Tag código:** `v0.7.0-b7`

---

## Estado

**PENDING — solo backup formal**

Smoke HTTP **PASS**. Env/SQL/Upstash demostrados por comportamiento en `www.altivoxai.es`.  
**No ACTIVE** todavía: falta evidencia de **backup** Supabase registrada por el owner  
([`BACKUP-EXECUTION.md`](./BACKUP-EXECUTION.md)).

Criterio respetado: no marcar ACTIVE sin backup real.

---

## Checklist final

| Ítem | Estado |
|------|--------|
| Env | **PASS** — [`FINAL-ENV-VALIDATION.md`](./FINAL-ENV-VALIDATION.md) |
| SQL | **PASS** — [`FINAL-SQL-VALIDATION.md`](./FINAL-SQL-VALIDATION.md) |
| Upstash | **PASS** (rate limit live 429 en login) |
| Backup | **PENDING** — [`BACKUP-EXECUTION.md`](./BACKUP-EXECUTION.md) |
| Smoke test | Código **PASS** · HTTP **PASS** — [`SMOKE-TEST-RESULT.md`](./SMOKE-TEST-RESULT.md) |

---

## Tests

```text
npm run test:core
```

**Resultado: PASS** (todas las suites OK)

---

## Seguridad (código + live)

| Área | |
|------|--|
| Auth | OK live |
| RLS / service_role | OK live |
| Review aislado | OK live `/r` |
| Agents privados | OK código |
| Deploy protegido | OK live `packaged` |
| Lead anon + RLS | OK código |

Live: [`SECURITY-PRODUCTION-CHECK.md`](./SECURITY-PRODUCTION-CHECK.md)

---

## Riesgos restantes

1. **Backup** no registrado (bloquea ACTIVE).  
2. Lead insert prod no re-probado en este smoke.  
3. Paquete deploy en `/tmp` es efímero por instancia (ADR-017: package interno; OK para smoke).  
4. Riesgo ops: no poner `ALTIVOX_*_STORE=memory` en Vercel.

Sin fallos de arquitectura, tests o ADRs.

---

## Cómo pasar a ACTIVE

Owner:

1. Completar backup y casillas en [`BACKUP-EXECUTION.md`](./BACKUP-EXECUTION.md).  
2. Avisar / cambiar este documento: **Estado → ACTIVE** + fecha/operador.

---

## Valoración

| Dimensión | Nota |
|-----------|------|
| Arquitectura | **9/10** |
| Producción live | **8/10** — smoke PASS; falta backup para ACTIVE |
