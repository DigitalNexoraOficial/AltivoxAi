# Go-live — release / backup / git

---

## Backup

| Check | Ops |
|-------|-----|
| Backup Supabase realizado (antes de migrate) | [ ] |
| Backup descargado / vault | [ ] |
| Restauración posible (probada en staging) | [ ] |

Procedimiento: [`backup-plan.md`](./backup-plan.md)

---

## Git — candidato de release

| Campo | Valor |
|-------|-------|
| Rama candidata | `cursor/go-live-execution-4521` |
| Incluye | B0–B7 + hardening + P0 docs + go-live docs |
| Commit base (pre go-live docs) | `4289558` (P0 readiness) |
| Tag RC propuesto | `v0.7.0-rc1-b7` (crear al merge a `main`) |

### Estado crítico `main` (2026-08-07)

`origin/main` **no** contiene B5–B7 ni hardening. PRs #11–#17 siguen en **DRAFT**.

| Check | Estado |
|-------|--------|
| Rama estable candidata | ✅ esta rama / stack PRs |
| Tag release en `main` | [ ] **bloqueado** hasta merge |
| Commit identificado en prod deploy | [ ] tras merge + tag |

### Acción requerida (owner)

1. Revisar y mergear en orden (o merge squash de la cadena) hacia `main`:  
   B5 → B6 → B7 → Hardening #16 → P0 #17 → **este PR go-live**.  
2. Taggear: `git tag -a v0.7.0-b7 -m "AltivoxAI B0-B7 production"`  
3. Desplegar Vercel desde `main` taggeado.

---

## Rollback

| Check | Estado |
|-------|--------|
| SQL rollback scripts en repo | ✅ `*-rollback.sql` (B2/B5/B6/B7 + rbac) |
| Procedimiento documentado | ✅ [`backup-plan.md`](./backup-plan.md) |
| Preferir restore dump vs rbac-rollback | ✅ (rbac-rollback abre policies) |
| Vercel promote previous | [ ] ops |

---

## Resultado fase 5

| Dimensión | Resultado |
|-----------|----------|
| Docs backup/rollback | **PASS** |
| Merge a `main` + tag prod | **BLOCKED** (PRs draft) |
| Backup Supabase real | **PENDING_OPS** |
