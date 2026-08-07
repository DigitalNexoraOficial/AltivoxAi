# ENV ACTIVATION CHECK — AltivoxAI OS v0.7.0-b7

**Fecha:** 2026-08-07  
**Tag:** `v0.7.0-b7` · **Main:** RELEASED  
**Agente:** sin acceso a Vercel/secrets de prod → casillas ops = owner

Referencias: [`.env.example`](../../.env.example) · [`env-checklist.md`](./env-checklist.md) · [`go-live-env-check.md`](./go-live-env-check.md)

---

## Variables necesarias

| Variable | Uso | Backend only | Código | Entorno prod (ops) |
|----------|-----|--------------|--------|--------------------|
| `SUPABASE_URL` | Auth, REST, stores | Prefer server | ✅ plantilla | [ ] |
| `SUPABASE_ANON_KEY` | Lead RLS, session, site-settings | Server (+ publishable en admin HTML) | ✅ | [ ] |
| `SUPABASE_SERVICE_ROLE_KEY` | PE/Agent/Review/Deploy SQL · audit · n8n | **Sí — nunca `NEXT_PUBLIC_`** | ✅ | [ ] |
| `UPSTASH_REDIS_REST_URL` | Rate limit prod | Sí | ✅ | [ ] |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limit prod | Sí | ✅ | [ ] |

### Recomendadas

| Variable | Uso | Ops |
|----------|-----|-----|
| `OPENROUTER_API_KEY` / `GEMINI_API_KEY` | Chat + Tool Registry LLM | [ ] |
| `N8N_WEBHOOK_URL` / `N8N_SECRET` | Automatización | [ ] |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` / `NEXT_PUBLIC_CAL_URL` | Marketing | [ ] |
| `RATE_LIMIT_MODE` | Prod: `upstash` o omitir (auto) | [ ] |

---

## Prohibido en producción

```text
ALTIVOX_AGENT_STORE=memory
ALTIVOX_REVIEW_STORE=memory
ALTIVOX_DEPLOY_STORE=memory
ALTIVOX_SELFTEST=1
RATE_LIMIT_MODE=memory   # no usar en tráfico público real
```

Con `SUPABASE_SERVICE_ROLE_KEY` presente y **sin** `ALTIVOX_*_STORE=memory` → stores SQL (persistencia real).

Nota: `.env.example` muestra `memory` solo como plantilla **local**. En Vercel **omitir** esas claves.

---

## Comprobaciones código

| Check | Resultado |
|-------|-----------|
| Lead no usa service_role | ✅ |
| service_role no en `NEXT_PUBLIC_*` / frontend | ✅ |
| Upstash fail-close en prod si falta Redis | ✅ (`rate-limit.ts`) |
| Env secrets no en git | ✅ |

---

## Resultado Fase 1

| Dimensión | Estado |
|-----------|--------|
| Plantilla / reglas | **PASS** |
| Configuración Vercel real | **PENDING** (ops) |

**Bloqueante ACTIVE:** sin confirmar las 5 variables core + omitir memory stores.
