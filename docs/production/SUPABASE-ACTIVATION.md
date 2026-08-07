# SUPABASE ACTIVATION — AltivoxAI OS v0.7.0-b7

**REGLA ABSOLUTA:** este documento **no** ejecuta migraciones.  
**NO** modificar SQL existente. **NO** crear tablas nuevas.

Scripts: `supabase/sql/` · Orden detallado: [`sql-checklist.md`](./sql-checklist.md) · [`go-live-supabase-runbook.md`](./go-live-supabase-runbook.md)

---

## Orden exacto de aplicación (ops manual)

| # | Paso | Script(s) | Notas |
|---|------|-----------|-------|
| 1 | **foundation** | Tabla `leads` (ya en proyecto) · `clientes.sql` · `site-settings.sql` | Antes de rbac |
| 2 | **audit-events** | `audit-events.sql` | Solo service_role |
| 3 | **rbac** | `rbac.sql` | Helpers + policies staff |
| 4 | **superadmin** | `assign-superadmin.sql` | Sustituir email real · logout/login |
| 5 | **project-engine** | `project-engine.sql` | Tras rbac + clientes |
| 6 | **agent-runtime** | `agent-runtime.sql` | Independiente de PE |
| 7 | **review** | `review.sql` | Independiente de PE |
| 8 | **deploy** | `deploy.sql` | Independiente de PE/Review |

### Opcional (pre-rbac only)

- `auth-admin-only.sql` — **solo** si faltan columnas lead; **nunca** después de `rbac.sql`
- `n8n.sql` — opcional; no endurecido por rbac

---

## Antes de aplicar

- [ ] Backup ([`BACKUP-EXECUTION.md`](./BACKUP-EXECUTION.md))  
- [ ] Proyecto Supabase correcto  
- [ ] Tag código `v0.7.0-b7` desplegado o listo  
- [ ] Rollback scripts presentes: `*-rollback.sql`

---

## Registro ops (rellenar)

| Paso | Aplicada | Fecha | Operador |
|------|----------|-------|----------|
| 1 foundation | [ ] | | |
| 2 audit-events | [ ] | | |
| 3 rbac | [ ] | | |
| 4 superadmin | [ ] | | |
| 5 project-engine | [ ] | | |
| 6 agent-runtime | [ ] | | |
| 7 review | [ ] | | |
| 8 deploy | [ ] | | |

---

## Post-apply checks

- [ ] RLS enabled en tablas OS  
- [ ] Anon insert leads OK; select leads DENY  
- [ ] Anon sin acceso projects/reviews/deployments/agents  
- [ ] Staff JWT con rol entra en `/ops`

---

## Resultado Fase 2

| Dimensión | Estado |
|-----------|--------|
| Runbook / orden | **PASS** (documentado) |
| SQL aplicado en prod | **PENDING** (ops — no auto) |
