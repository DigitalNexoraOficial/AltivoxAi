# SMOKE TEST RESULT — AltivoxAI OS v0.7.0-b7

**Fecha código:** 2026-08-07  
Procedimiento: [`smoke-test.md`](./smoke-test.md) · [`go-live-smoke-test.md`](./go-live-smoke-test.md)

---

## Capa A — Smoke código (ejecutado)

`npm run test:core` en tip `v0.7.0-b7` / activation branch:

| Suite | Resultado |
|-------|-----------|
| security | OK |
| project-engine | OK |
| jarvis | OK |
| engines-contracts | OK |
| agent-runtime | OK |
| review-engine | OK |
| deploy-engine | OK |

Flujo de dominio cubierto por selftests:

```text
Project Engine → (contratos) → Review Engine (token, approve ≠ PE) → Deploy Engine (ZIP packaged)
```

---

## Capa B — Smoke HTTP real (ops)

**Estado:** no ejecutado en este agente (sin URL/credenciales prod).

### Proyecto

- [ ] Login OPS  
- [ ] Crear proyecto  
- [ ] Crear versión  
- [ ] Registrar deliverable  

### Review

- [ ] Crear sesión Review (Ops)  
- [ ] Generar token  
- [ ] Abrir `/r/[token]` sin cookie staff  
- [ ] Cliente: ver deliverables · comentar · cambios · aprobar/rechazar  
- [ ] Confirmar: `projects.status` **no** cambia solo por approve  

### Deploy

- [ ] Crear deployment  
- [ ] Ejecutar build  
- [ ] Generar ZIP (`packaged`)  
- [ ] Verificar `deployment_events` / historial  

### Flujo esperado

```text
Project Engine → Review Engine → Deploy Engine
```

---

## Resultado Fase 5

| Capa | Estado |
|------|--------|
| Selftests / contratos | **PASS** |
| HTTP producción | **PENDING** |

**Firma ops HTTP:** _______________ **Fecha:** _______________
