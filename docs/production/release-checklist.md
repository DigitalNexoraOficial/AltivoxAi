# Release checklist — AltivoxAI

Post B0–B7 · sin B8. Complementa [`../deployment.md`](../deployment.md).

---

## Antes del lanzamiento

- [ ] Migraciones aplicadas ([`sql-checklist.md`](./sql-checklist.md))  
- [ ] Variables configuradas ([`env-checklist.md`](./env-checklist.md))  
- [ ] Tests OK — `npm run test:core`  
- [ ] Smoke test OK ([`smoke-test.md`](./smoke-test.md))  
- [ ] Backup realizado ([`backup-plan.md`](./backup-plan.md))  
- [ ] Rollback disponible (scripts + tag + Vercel previous)  
- [ ] Security revisada ([`security-audit.md`](./security-audit.md))  
- [ ] RLS revisada (anon/staff; no re-aplicar scripts legacy post-rbac)  
- [ ] Dominio configurado (DNS · Vercel · `ALLOWED_ORIGINS` lead si aplica)  
- [ ] Upstash rate limit en prod  
- [ ] `assign-superadmin` / roles staff OK  
- [ ] SEO: `/r` noindex · `/legacy` disallow · sitemap limpio  
- [ ] Tag release git  

---

## Después del lanzamiento

- [ ] Revisar logs (Vercel + Supabase)  
- [ ] Revisar errores 4xx/5xx en `/api/ops`, `/api/review`, `/api/lead`  
- [ ] Revisar consumo IA (OpenRouter/Gemini)  
- [ ] Revisar Supabase (storage size, RLS denials, auth)  
- [ ] Confirmar leads llegan y n8n (si activo)  
- [ ] Confirmar un ciclo Review + Deploy de prueba en prod (datos dummy)  
- [ ] Anotar incidentes / follow-ups (sin abrir B8 de motores)

---

## Criterio GO / NO-GO

| Condición | GO si… |
|-----------|--------|
| Tests | `test:core` verde |
| SQL | B1–B7 aplicadas y validadas |
| Env | Obligatorias + Upstash |
| Smoke | PE + Review (sin mutar PE) + Deploy ZIP |
| Security | Lead anon; portal token-only; agents sin review/deploy |
| Backup | Dump/tag listos |

**NO-GO** si: falta Upstash en prod, stores en `memory`, RLS legacy abierta, o smoke Review muta PE.
