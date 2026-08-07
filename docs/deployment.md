# Deployment — Altivox OS

---

## 1. Topología

```
GitHub → Vercel
          ├─ Web pública (producción actual)
          ├─ /ops (futuro, mismo deploy o path)
          └─ /r/[token] (futuro)

Supabase = Auth + DB
n8n = automatización ops
LLM providers = chat público + (futuro) agent runtime OS
```

---

## 2. Separación conceptual

| Capa | Qué se despliega |
|------|------------------|
| Marketing site | Landing, casos, APIs públicas |
| Altivox OS | App `/ops` + `/api/ops` |
| Review portal | `/r` + `/api/review` |
| Worker/agents (futuro) | Puede ser mismo Node o cola externa |

Mismo repositorio permitido; **límites de seguridad** por ruta y rol, no por “otro dominio” obligatorio en v1.

---

## 3. As-is

- `npm run build` / Vercel  
- Env: `SUPABASE_*`, `N8N_*`, LLM keys, WA/Cal públicos  
- SQL manual en Supabase Editor  
- Admin estático en `public/*.html`

---

## 4. To-be entregables de **proyectos cliente** (Fase 7)

No confundir con deploy de Altivox:

1. Artefacto ZIP (código, docs, guía, `.env.example`, README).  
2. Adapters opcionales: GitHub, Vercel, WordPress, FTP, …  
3. **Siempre confirmación humana** antes de publicar en destino del cliente.  
4. Registro en `deployments` + eventos.

Los adapters son **plugins**; añadir destino nuevo no modifica el núcleo OS.

---

## 5. Checklist release Altivox (plataforma)

1. lint + build  
2. SQL/migraciones aplicadas  
3. Env completas  
4. Smoke pública: `/`, lead, chat  
5. Smoke OS (cuando exista): login RBAC, proyecto  
6. Smoke review: token, sin fuga de internos  

---

## 6. Rollback

Vercel promote previous · SQL aditivo con script inverso documentado · desactivar workflows n8n.
