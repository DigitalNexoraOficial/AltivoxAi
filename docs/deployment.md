# Deployment — Altivox OS

---

## 1. Topología

```
GitHub → Vercel
          ├─ Web pública (producción actual)
          ├─ /ops (implementado · Bloque 3; mismo deploy / path)
          └─ /r/[token] (implementado · Bloque 6 · ADR-016)

Supabase = Auth + DB
n8n = automatización ops
LLM providers = chat público + agent runtime OS (Bloque 5 · interno)
```

---

## 2. Separación conceptual

| Capa | Qué se despliega |
|------|------------------|
| Marketing site | Landing, casos, APIs públicas |
| Altivox OS | App `/ops` + `/api/ops` |
| Review portal | `/r` + `/api/review` — **B6 cerrado** |
| Worker/agents | Agent Runtime B5 (mismo Node hoy); cola externa = futuro |

Mismo repositorio permitido; **límites de seguridad** por ruta y rol, no por “otro dominio” obligatorio en v1.

**No confundir:**

- Deploy de la **plataforma** Altivox (este doc §5) ≠  
- **Deployment Engine** de proyectos cliente (**Bloque 7**, fuera de B6).

---

## 3. As-is

- `npm run build` / Vercel  
- Env: `SUPABASE_*`, `N8N_*`, LLM keys, WA/Cal públicos  
- SQL manual en Supabase Editor (B1/B2/B5 según entorno)  
- Shell `/ops` App Router (**Bloque 3 cerrado**) + `/api/ops/*` (PE + agentes)  
- Admin estático en `public/*.html` (CRM/legacy temporal)  
- Portal `/r/[token]`: **implementado** (ADR-016)  
- Deployment Engine de proyectos cliente: **contrato ADR-017 · no implementado** (B7-A)

---

## 4. To-be entregables de **proyectos cliente** (Fase 7 · ADR-017)

**Contrato:** [`ADR-017`](./adr/ADR-017-bloque-7-deploy-engine.md). Prebloque B7-A (docs only).

No confundir con deploy de Altivox ni con Review (B6):

1. **ZIP pipeline** — entrada: deliverables/versiones **approved**; salida: artefacto interno.  
2. Deploy Engine — estados `draft|queued|building|packaged|deploying|deployed|failed|cancelled`.  
3. Persistencia futura: `deployments` · eventos · artifacts · configs.  
4. **Sin providers externos en B7 inicial** (Vercel/Netlify/AWS/GitHub Deploy/FTP = posterior vía adapters).  
5. **Prohibido** auto-deploy tras aprobación Review.  
6. APIs futuras solo Ops (`/api/ops/deployments*`); nunca `/api/public/deploy`.

**Código B7 bloqueado** hasta «OK implementar Bloque 7».

---

## 5. Checklist release Altivox (plataforma)

1. lint + build  
2. SQL/migraciones aplicadas  
3. Env completas  
4. Smoke pública: `/`, lead, chat  
5. Smoke OS (`/ops` B3): login RBAC, proyecto  
6. Smoke agentes (B5): run interno sin fuga a pública  
7. Smoke review (B6): token, sin sesión staff, sin fuga de internos, `noindex`  

---

## 6. Rollback

Vercel promote previous · SQL aditivo con script inverso documentado · desactivar workflows n8n.
