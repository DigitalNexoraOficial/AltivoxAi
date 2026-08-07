# Producción — AltivoxAI (post B0–B7)

Documentación de **preparación para lanzamiento real**.  
**No** es B8. **No** añade motores ni features.

## Go-live (fase final)

| Documento | Contenido |
|-----------|-----------|
| [`FINAL-RELEASE-REPORT.md`](./FINAL-RELEASE-REPORT.md) | **Informe final** GO/NO-GO |
| [`go-live-env-check.md`](./go-live-env-check.md) | Variables · Upstash · stores |
| [`go-live-sql-check.md`](./go-live-sql-check.md) | Migraciones · RLS · separación motores |
| [`go-live-security.md`](./go-live-security.md) | Security final check |
| [`go-live-smoke-test.md`](./go-live-smoke-test.md) | Smoke código + HTTP ops |
| [`go-live-release.md`](./go-live-release.md) | Backup · git · rollback |

## P0 readiness

| Documento | Contenido |
|-----------|-----------|
| [`sql-checklist.md`](./sql-checklist.md) | Migraciones SQL B1–B7 · orden · rollback |
| [`env-checklist.md`](./env-checklist.md) | Variables de entorno |
| [`smoke-test.md`](./smoke-test.md) | Smoke E2E manual (PE → Review → Deploy) |
| [`backup-plan.md`](./backup-plan.md) | Backup Supabase · tags · rollback |
| [`release-checklist.md`](./release-checklist.md) | Checklist pre/post lanzamiento |
| [`security-audit.md`](./security-audit.md) | Auditoría seguridad P0 |
| [`production-review.md`](./production-review.md) | Perf · SEO · logs · hallazgos |

Visión operativa general: [`../deployment.md`](../deployment.md).

**Veredicto go-live (2026-08-07):** código **GO** · producción real **NO-GO** hasta merge a `main` + checklist ops — ver [`FINAL-RELEASE-REPORT.md`](./FINAL-RELEASE-REPORT.md).
