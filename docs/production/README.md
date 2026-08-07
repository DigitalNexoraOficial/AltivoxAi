# Producción — AltivoxAI (post B0–B7)

Documentación de **preparación para lanzamiento real**.  
**No** es B8. **No** añade motores ni features.

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

**Veredicto código (auditoría P0):** GO condicionado a checklist ops en el entorno.
