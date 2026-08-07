# Revisión de producción P0 (rendimiento · seguridad · SEO · logs)

Auditoría **read-only** de código · actualizado release RC `v0.7.0-rc1-b7` (2026-08-07).

**Estado release:** candidate READY · `main` sin merge · ver [`FINAL-GO-LIVE-REPORT.md`](./FINAL-GO-LIVE-REPORT.md).

Sin cambios de motores.

---

## Rendimiento

| Hallazgo | Severidad | Notas |
|----------|-----------|-------|
| Stores SQL engines usan REST puntuales por operación | INFO | Aceptable v1; sin N+1 crítico documentado en selftests |
| Rate limit Upstash round-trip por request sensible | INFO | Correcto para seguridad; configurar límites por bucket |
| Chat / LLM síncrono en request | WARN | Latencia variable; timeout/provider failover ops |
| Admin HTML + App Router coexistentes | INFO | CRM puente; no optimizar ahora (fuera de alcance) |
| Portal `/r` fetch por token | OK | Superficie mínima |

**Acción P0:** ninguna de código. Monitorizar latencia `/api/ops` y LLM en post-launch.

---

## Seguridad (extra)

| Hallazgo | Severidad | Estado |
|----------|-----------|--------|
| Lead sin service_role | — | ✅ Hardening |
| Anon key en `admin-core.js` | INFO | Publishable esperado |
| Fallback `SUPABASE_URL` hardcodeado en varios módulos | WARN | Setear env explícito en prod |
| Logs: lead route loguea `e.code` no body PII completo | OK | Revisar no loguear tokens Review |
| Token Review plaintext solo al crear | OK | Hash en DB |
| Legacy aislado + auth | OK | |

---

## SEO

| Superficie | Control | Estado |
|------------|---------|--------|
| `/r/[token]` | `robots: noindex` en layout | ✅ |
| `/ops` | noindex layout | ✅ |
| `/legacy/` | `robots.txt` Disallow + meta en HTML | ✅ |
| Sitemap | Solo marketing | ✅ |
| Públicas `/`, casos | Indexables | ✅ |

---

## Logs y auditoría

| Fuente | Contenido | Secretos |
|--------|-----------|----------|
| `audit_events` | actor, action, result, ip | Via service_role insert; sin policies client |
| Vercel logs | Errores API | No imprimir tokens / service_role |
| n8n | Eventos lead | Secret header |

**Checklist ops:** no habilitar debug que vuelque JWT o token Review en logs públicos.

---

## Resumen

Preparación de **lanzamiento** OK a nivel código. Pendiente checklist entorno (SQL, env, Upstash, backup, smoke manual).
