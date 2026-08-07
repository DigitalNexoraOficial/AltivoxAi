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

- Deploy de la **plataforma** Altivox (este doc §5–§6) ≠  
- **Deployment Engine** de proyectos cliente (**Bloque 7 cerrado**).

---

## 3. As-is

- `npm run build` / Vercel  
- Env: ver [`.env.example`](../.env.example) — `SUPABASE_*`, `N8N_*`, LLM keys, WA/Cal públicos, stores runtime  
- SQL manual en Supabase Editor (B1/B2/B5/B6/B7 según entorno)  
- Shell `/ops` App Router (**Bloque 3 cerrado**) + `/api/ops/*` (PE + agentes + reviews + deployments)  
- Admin CRM en `public/*.html`; UIs cosméticas JARVIS/agentes/chatbot en `public/legacy/`  
- Portal `/r/[token]`: **implementado** (ADR-016)  
- Deployment Engine (ZIP interno): **implementado** (ADR-017 · sin providers externos)

---

## 4. Entregables de **proyectos cliente** (Fase 7 · ADR-017 · cerrado)

**Contrato:** [`ADR-017`](./adr/ADR-017-bloque-7-deploy-engine.md).

1. **ZIP pipeline** — packaging interno reproducible (`packaged`).  
2. Deploy Engine — estados ADR-017; execute: `draft→queued→building→packaged`.  
3. Persistencia: `deployments` · `deployment_events`.  
4. **Sin providers externos** en este recorte.  
5. **Prohibido** auto-deploy tras Review.  
6. APIs Ops `/api/ops/deployments*`; nunca `/api/public/deploy`.

Aplicar `supabase/sql/deploy.sql` en el entorno.

---

## 5. Checklist release Altivox (plataforma)

**Detalle P0:** carpeta [`docs/production/`](./production/README.md)  
(`sql-checklist` · `env-checklist` · `smoke-test` · `backup-plan` · `release-checklist` · `security-audit`).

1. lint + build  
2. SQL/migraciones aplicadas  
3. Env completas (`.env.example` + `env-checklist.md`)  
4. Smoke pública: `/`, lead, chat  
5. Smoke OS (`/ops` B3): login RBAC, proyecto  
6. Smoke agentes (B5): run interno sin fuga a pública  
7. Smoke review (B6): token, sin sesión staff, sin fuga de internos, `noindex`  
8. Smoke deploy (B7): create → execute → `packaged` ZIP  

---

## Antes de producción

Detalle go-live: [`docs/production/FINAL-GO-LIVE-REPORT.md`](./production/FINAL-GO-LIVE-REPORT.md) · audit: [`RELEASE-AUDIT.md`](./production/RELEASE-AUDIT.md).

Activación: [`docs/production/PRODUCTION-ACTIVATION-REPORT.md`](./production/PRODUCTION-ACTIVATION-REPORT.md).

**Version:** `v0.7.0-b7` · **Status código:** PRODUCTION RELEASE · **Status entorno:** PENDING ops.

- [x] Release mergeado a `main`  
- [x] Tag `v0.7.0-b7`  
- [ ] Ejecutar migraciones SQL B1-B7  
- [ ] Revisar variables entorno (sin `ALTIVOX_*_STORE=memory`)  
- [ ] Upstash configurado  
- [ ] Ejecutar tests  
- [ ] Ejecutar smoke test APIs  
- [ ] Verificar RLS  
- [ ] Verificar permisos `can()`  
- [ ] Backup Supabase  
- [ ] Rollback disponible  

Detalle SQL típico: `rbac.sql` · `audit-events.sql` · `project-engine.sql` · `agent-runtime.sql` · `review.sql` · `deploy.sql` (+ `assign-superadmin.sql`).

Tests: `npm run test:core` (security · PE · JARVIS · engines · agent-runtime · review · deploy).

---

## 6. Rollback

Vercel promote previous · SQL aditivo con script inverso documentado (`*-rollback.sql`) · desactivar workflows n8n.
