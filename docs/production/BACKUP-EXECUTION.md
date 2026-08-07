# BACKUP EXECUTION — AltivoxAI OS v0.7.0-b7

Antes de aplicar SQL o cambiar env en producción.

Procedimiento base: [`backup-plan.md`](./backup-plan.md)

---

## Antes de producción

| Check | Ops |
|-------|-----|
| Backup Supabase realizado (Dashboard o `pg_dump`) | [ ] |
| Backup descargado / vault | [ ] |
| Restauración posible (staging) | [ ] |
| Versión código confirmada | [ ] |
| Tag oficial confirmado: **`v0.7.0-b7`** | [x] en Git |

```bash
git fetch --tags
git rev-parse v0.7.0-b7^{}
# esperado: tip main con B0–B7
```

---

## Rollback preparado

### SQL

| Script | Uso |
|--------|-----|
| `deploy-rollback.sql` | Quitar Deploy Engine |
| `review-rollback.sql` | Quitar Review Engine |
| `agent-runtime-rollback.sql` | Quitar Agent Runtime |
| `project-engine-rollback.sql` | Quitar PE |
| `rbac-rollback.sql` | ⚠️ restaura policies abiertas — preferir **restore dump** |

Orden rollback (si hace falta parcial): Deploy → Review → Agent → PE → (evitar rbac-rollback si hay dump).

### Git

| Acción | Comando / nota |
|--------|----------------|
| Volver a release estable | checkout / deploy tag `v0.7.0-b7` |
| Rollback código anterior a OS | tag/commit pre-merge `b8ca1b8` (landing only) |
| Vercel | Promote previous deployment |

---

## Registro

| Ítem | Valor |
|------|-------|
| Fecha backup | _______________ |
| Operador | _______________ |
| Ubicación dump | _______________ |
| Tag código | `v0.7.0-b7` |

---

## Resultado Fase 4

| Dimensión | Estado |
|-----------|--------|
| Procedimiento documentado | **PASS** |
| Backup real ejecutado | **PENDING** (ops) |
