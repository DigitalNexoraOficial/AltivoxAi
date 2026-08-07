# Producción — AltivoxAI (post B0–B7)

Documentación de **preparación para lanzamiento real**.  
**No** es B8. **No** añade motores ni features.

## Production activation (v0.7.0-b7)

| Documento | Contenido |
|-----------|-----------|
| [`PRODUCTION-ACTIVATION-REPORT.md`](./PRODUCTION-ACTIVATION-REPORT.md) | **Informe activación** · smoke PASS · **PENDING backup** → ACTIVE |
| [`FINAL-ENV-VALIDATION.md`](./FINAL-ENV-VALIDATION.md) | Env final · **PASS** (smoke) |
| [`FINAL-SQL-VALIDATION.md`](./FINAL-SQL-VALIDATION.md) | SQL final · **PASS** (smoke) |
| [`ENV-ACTIVATION-CHECK.md`](./ENV-ACTIVATION-CHECK.md) | Variables · prohibido memory stores |
| [`SUPABASE-ACTIVATION.md`](./SUPABASE-ACTIVATION.md) | Orden SQL (no auto) |
| [`SECURITY-PRODUCTION-CHECK.md`](./SECURITY-PRODUCTION-CHECK.md) | Security prod |
| [`BACKUP-EXECUTION.md`](./BACKUP-EXECUTION.md) | Backup + rollback |
| [`SMOKE-TEST-RESULT.md`](./SMOKE-TEST-RESULT.md) | Smoke A+B **PASS** (live 2026-08-07) |

## Release v0.7.0-b7

| Documento | Contenido |
|-----------|-----------|
| [`FINAL-RELEASE-v0.7.0-b7.md`](./FINAL-RELEASE-v0.7.0-b7.md) | Documento oficial de release |
| [`RELEASE-CLOSURE-REPORT.md`](./RELEASE-CLOSURE-REPORT.md) | Cierre · estado RELEASED |
| [`FINAL-GO-LIVE-REPORT.md`](./FINAL-GO-LIVE-REPORT.md) | Status producción |
| [`PRE-MERGE-RELEASE-CHECK.md`](./PRE-MERGE-RELEASE-CHECK.md) | Auditoría pre-merge |
| [`RELEASE-AUDIT.md`](./RELEASE-AUDIT.md) | Auditoría Git RC vs main |
| [`RELEASE-DIFF-REPORT.md`](./RELEASE-DIFF-REPORT.md) | Diff + secrets + architecture |
| [`final-security-check.md`](./final-security-check.md) | Security final |
| [`go-live-supabase-runbook.md`](./go-live-supabase-runbook.md) | SQL orden (no auto-run) |

**Estado:** código **RELEASED** en `main` · tag **`v0.7.0-b7`** · ops env/SQL/smoke **pendiente**.

## Go-live checklists

| Documento | Contenido |
|-----------|-----------|
| [`FINAL-RELEASE-REPORT.md`](./FINAL-RELEASE-REPORT.md) | Informe go-live previo |
| [`go-live-env-check.md`](./go-live-env-check.md) | Variables · Upstash · stores |
| [`go-live-sql-check.md`](./go-live-sql-check.md) | Migraciones · RLS |
| [`go-live-security.md`](./go-live-security.md) | Security go-live |
| [`go-live-smoke-test.md`](./go-live-smoke-test.md) | Smoke código + HTTP |
| [`go-live-release.md`](./go-live-release.md) | Backup · git · rollback |

## P0 readiness

| Documento | Contenido |
|-----------|-----------|
| [`sql-checklist.md`](./sql-checklist.md) | Migraciones SQL B1–B7 |
| [`env-checklist.md`](./env-checklist.md) | Variables de entorno |
| [`smoke-test.md`](./smoke-test.md) | Smoke E2E manual |
| [`backup-plan.md`](./backup-plan.md) | Backup · rollback |
| [`release-checklist.md`](./release-checklist.md) | Checklist pre/post |
| [`security-audit.md`](./security-audit.md) | Auditoría seguridad P0 |
| [`production-review.md`](./production-review.md) | Perf · SEO · logs |

Visión: [`../deployment.md`](../deployment.md).

**Estado:** código **RELEASED** (`v0.7.0-b7`) · producción live **PENDING** — [`PRODUCTION-ACTIVATION-REPORT.md`](./PRODUCTION-ACTIVATION-REPORT.md).
