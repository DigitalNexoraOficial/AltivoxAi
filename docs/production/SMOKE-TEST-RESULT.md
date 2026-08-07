# SMOKE TEST RESULT — AltivoxAI OS v0.7.0-b7

**Fecha:** 2026-08-07  
**Operador live:** Xabier (`altivoxaiofi@gmail.com` · superadmin)  
Procedimiento: [`smoke-test.md`](./smoke-test.md)

---

## Resultado global smoke

| Capa | Resultado |
|------|-----------|
| A · Selftests / `test:core` | **PASS** |
| B · HTTP E2E producción (`https://www.altivoxai.es`) | **PASS** |

**Registro formal capa B:** **PASS** (evidencia owner 2026-08-07).

---

## Capa A — Código (ejecutado)

```text
security.selftest: ok
project-engine.selftest: ok
jarvis.selftest: ok
engines-contracts.selftest: ok
agent-runtime.selftest: ok
review-engine.selftest: ok
deploy-engine.selftest: ok
```

---

## Capa B — Flujo HTTP (producción)

```text
Usuario → Login → Proyecto → Versión → Deliverable
  → Review → /r/[token] → aprobar
  → Deploy → ZIP packaged
```

| Paso | Resultado | Evidencia |
|------|-----------|-----------|
| Login OPS | **PASS** | `/ops` · superadmin |
| Crear proyecto | **PASS** | Prueba · `8c118c9f-656a-4380-a5b9-df9f3cb351d5` |
| Crear versión | **PASS** | v1 · `65ccbac6-7787-483b-b894-36599cb17ff8` |
| Registrar deliverable | **PASS** | Home · artifact |
| Crear Review + token | **PASS** | review `sent` + portal `/r/…` |
| Abrir `/r/[token]` | **PASS** | Estado Vista |
| Cliente aprueba | **PASS** | Estado Aprobada · terminal |
| Crear Deploy + ZIP | **PASS** | `57c89a66-0b19-49d2-81f6-be99b0219c1f` · `status: packaged` · `packageUri` bajo `/tmp/altivox-packages/…` |

**Firma ops:** Xabier · **Fecha:** 2026-08-07 · **PASS/FAIL:** **PASS**

---

## Veredicto Fase 5

Smoke producción live: **PASS**.  
Smoke código: **PASS**.
