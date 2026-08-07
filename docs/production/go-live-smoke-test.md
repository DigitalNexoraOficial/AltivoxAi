# Go-live — smoke test

Procedimiento E2E: también [`smoke-test.md`](./smoke-test.md)

## Doble capa

| Capa | Qué valida | Estado 2026-08-07 |
|------|------------|-------------------|
| **A. Código (selftests)** | PE · JARVIS · Agent · Review · Deploy contratos | ✅ `npm run test:core` **OK** |
| **B. HTTP real (staging/prod)** | APIs + UI + DB + ZIP filesystem | [ ] **PENDING_OPS** |

Sin credenciales de prod en el agente cloud → la capa B queda para el owner en Vercel/Supabase.

---

## A. Smoke código (ejecutado)

```text
security.selftest: ok
project-engine.selftest: ok
jarvis.selftest: ok
engines-contracts.selftest: ok
agent-runtime.selftest: ok
review-engine.selftest: ok   ← incluye: approve ≠ transitionProject
deploy-engine.selftest: ok   ← ZIP packaged + events
```

---

## B. Smoke HTTP real (ops)

### Project Engine

- [ ] 1. Crear proyecto (`POST /api/ops/projects` o UI `/ops`)  
- [ ] 2. Crear versión  
- [ ] 3. Registrar deliverable  

### Review Engine

- [ ] 4. Crear review desde Ops (`POST /api/ops/reviews`)  
- [ ] 5. Guardar token (una vez)  
- [ ] 6. Abrir `/r/[token]` **sin** cookie staff  
- [ ] 7. Comentar  
- [ ] 8. Solicitar cambios  
- [ ] 9. Aprobar (nueva sesión si hace falta)  
- [ ] **Confirmación:** `projects.status` **NO** cambia solo por approve  

### Deploy Engine

- [ ] 10. Crear deployment (`POST /api/ops/deployments`)  
- [ ] 11. Ejecutar (`…/execute`)  
- [ ] 12. ZIP generado (`packaged`)  
- [ ] `deployment_events` registrados  
- [ ] Estado final esperado (`packaged` sin vendors)  

### Pública

- [ ] GET `/`  
- [ ] POST `/api/lead`  
- [ ] Rate limit 429 con Upstash  

---

## Resultado fase 4

| Capa | Resultado |
|------|----------|
| Selftests / contratos | **PASS** |
| Smoke HTTP producción | **PENDING_OPS** |
