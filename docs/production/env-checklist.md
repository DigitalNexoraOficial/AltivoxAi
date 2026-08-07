# Variables de entorno — producción

Fuente plantilla: [`.env.example`](../../.env.example)  
Auditoría P0 · comparación con `process.env.*` en código · **sin secretos reales**.

---

## Checklist

| Variable | Uso | Obligatoria (prod) | Entorno |
|----------|-----|--------------------|---------|
| `SUPABASE_URL` | Auth, REST, stores PE/Agent/Review/Deploy, audit, lead, n8n, session | **Sí** | Server (+ build) |
| `SUPABASE_ANON_KEY` | Lead público (RLS), site-settings GET, session resolve, ops site-settings JWT path | **Sí** | Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Alias opcional para lead | No (si `SUPABASE_ANON_KEY` existe) | Server / public |
| `SUPABASE_SERVICE_ROLE_KEY` | Stores SQL engines, audit insert, n8n CRM writes | **Sí** (OS) | **Solo server** — nunca `NEXT_PUBLIC_*` |
| `SUPABASE_SECRET_KEY` | Alias legado (no preferido) | No | Server |
| `OPENROUTER_API_KEY` | Chat público + Tool Registry `llm.complete` | Sí si usas OpenRouter | Server |
| `OPENROUTER_MODEL` | Modelo OpenRouter | No (default en código) | Server |
| `GEMINI_API_KEY` | Fallback LLM | Recomendada si no hay OpenRouter | Server |
| `GEMINI_MODEL` | Modelo Gemini | No | Server |
| `N8N_WEBHOOK_URL` | Forward lead / emit n8n | Recomendada | Server |
| `N8N_WEBHOOK_TEST` | Override test en `/api/n8n` | No | Server |
| `N8N_SECRET` | Auth integración n8n | **Sí** si n8n activo | Server |
| `RATE_LIMIT_MODE` | `memory` \| `upstash` | Prod: `upstash` o omitir (auto) | Server |
| `UPSTASH_REDIS_REST_URL` | Rate limit prod | **Sí** en prod | Server |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limit prod | **Sí** en prod | Server |
| `ALTIVOX_AGENT_STORE` | `memory` \| sql (default sql si hay service_role) | Prod: **omitir** o no `memory` | Server |
| `ALTIVOX_REVIEW_STORE` | Idem Review | Prod: **omitir** | Server |
| `ALTIVOX_DEPLOY_STORE` | Idem Deploy | Prod: **omitir** | Server |
| `ALTIVOX_DEPLOY_PACKAGE_DIR` | Dir ZIP filesystem | Opcional | Server |
| `ALTIVOX_SELFTEST` | Fuerza stores memory en selftests | **Nunca** en prod | Local/CI |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | CTA WhatsApp | Recomendada | Public |
| `NEXT_PUBLIC_CAL_URL` | Booking Cal.com | Recomendada | Public |
| `NODE_ENV` | Cookie secure, rate-limit defaults | Sí (Vercel) | Runtime |

---

## Uso correcto por superficie

| Superficie | Claves |
|------------|--------|
| `/api/lead` | **Solo** anon (`SUPABASE_ANON_KEY` / `NEXT_PUBLIC_…`) — **prohibido** service_role |
| `/api/site-settings` GET | Anon |
| `/api/ops/*` engines | service_role en stores **después** de `can()` / sesión |
| Audit | service_role |
| `/api/n8n` | service_role + `N8N_SECRET` o staff |
| Chat / Agent LLM | OpenRouter y/o Gemini |
| Rate limit | Upstash obligatorio en producción (fail-close si falta) |

---

## Notas de auditoría

1. Código tiene fallback hardcodeado de `SUPABASE_URL` a un proyecto concreto — **en prod debe setearse `SUPABASE_URL` explícito**.  
2. `admin-core.js` lleva anon publishable (esperado); no service_role.  
3. Con `ALTIVOX_*_STORE=memory` (como en `.env.example` de ejemplo local) **no** se persiste a SQL — en Vercel **quitar** esas líneas o no poner `memory`.  
4. Sin secretos en git: solo `.env.example` con placeholders.

---

## Validación rápida

- [ ] Vercel: todas las obligatorias presentes  
- [ ] Ninguna `SERVICE_ROLE` / `*_SECRET` / API key con prefijo `NEXT_PUBLIC_`  
- [ ] `RATE_LIMIT_MODE` / Upstash verificados (smoke 429)  
- [ ] Lead insert funciona con solo anon + RLS  
- [ ] PE/Review/Deploy crean filas en Supabase (stores ≠ memory)
