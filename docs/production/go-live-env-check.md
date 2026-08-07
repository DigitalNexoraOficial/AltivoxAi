# Go-live — comprobación de entorno

**Fecha auditoría código:** 2026-08-07 · Commit base candidato: ver [`go-live-release.md`](./go-live-release.md)  
**Agente:** sin acceso a Vercel/Supabase de producción → casillas ops = **pendiente humano**.

Referencia plantilla: [`.env.example`](../../.env.example) · detalle: [`env-checklist.md`](./env-checklist.md)

---

## Supabase

| Check | Código / plantilla | Entorno prod (ops) |
|-------|--------------------|--------------------|
| `SUPABASE_URL` configurada | ✅ documentada | [ ] |
| `SUPABASE_ANON_KEY` configurada | ✅ documentada | [ ] |
| `SUPABASE_SERVICE_ROLE_KEY` solo servidor | ✅ (no `NEXT_PUBLIC_`) | [ ] |
| Sin claves service_role en frontend | ✅ auditado (`public/` solo anon publishable) | [ ] |

---

## IA / Runtime

| Check | Código / plantilla | Entorno prod (ops) |
|-------|--------------------|--------------------|
| Variables IA (`OPENROUTER_*` / `GEMINI_*`) | ✅ en `.env.example` | [ ] |
| Agent Runtime **no** usa `memory` store | ⚠️ plantilla local = memory; **prod: omitir** `ALTIVOX_AGENT_STORE` | [ ] |
| Review **no** usa memoria temporal | ⚠️ idem `ALTIVOX_REVIEW_STORE` | [ ] |
| Deploy preparado (SQL store + package dir opcional) | ✅ documentado; omitir `ALTIVOX_DEPLOY_STORE=memory` | [ ] |

### Prohibido en producción

```
ALTIVOX_AGENT_STORE=memory
ALTIVOX_REVIEW_STORE=memory
ALTIVOX_DEPLOY_STORE=memory
ALTIVOX_SELFTEST=1
```

Con `SUPABASE_SERVICE_ROLE_KEY` y **sin** esas vars → stores SQL activos.

---

## Upstash

| Check | Código | Entorno prod (ops) |
|-------|--------|--------------------|
| `UPSTASH_REDIS_REST_URL` | ✅ requerida en prod (`rate-limit.ts` fail-close) | [ ] |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | [ ] |
| Redis activo | — | [ ] |
| Rate limits funcionando (429 en exceso) | lógica OK en código | [ ] |
| `RATE_LIMIT_MODE` | Prod: `upstash` o omitir (auto) — **no** dejar `memory` en prod público | [ ] |

---

## Otras

| Check | Ops |
|-------|-----|
| `N8N_SECRET` / webhook si n8n activo | [ ] |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` / `NEXT_PUBLIC_CAL_URL` | [ ] |
| Dominio + CORS lead (`ALLOWED_ORIGINS` en código) | [ ] |

---

## Resultado fase 1

| Dimensión | Resultado |
|-----------|----------|
| Plantilla / código | **PASS** |
| Configuración Vercel real | **PENDING_OPS** |

**Bloqueante go-live:** sin confirmación ops de env + Upstash + stores ≠ memory → **no desplegar**.
