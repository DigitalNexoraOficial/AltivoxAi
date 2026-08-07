# Backup y rollback — producción

Auditoría P0 · AltivoxAI post B0–B7.

---

## 1. Supabase — antes de migraciones

### Backup

1. Dashboard Supabase → **Database** → Backups (plan Pro) **o**  
2. `pg_dump` lógico:

```bash
# Ejemplo — credenciales solo en entorno seguro
pg_dump "$DATABASE_URL" --format=custom --file="altivox-pre-$(date -u +%Y%m%dT%H%M%SZ).dump"
```

3. Export Auth users / anotar `app_metadata.role` de staff.  
4. Guardar dump fuera del repo (S3 / vault equipo).

### Comprobación backup

- [ ] Tamaño dump > 0  
- [ ] Restauración de prueba en **proyecto staging** (no prod)  
- [ ] Tablas clave listables tras restore: `leads`, `projects`, `reviews`, `deployments`

### Restauración (incidente)

1. Pausa writes (maintenance / freeze deploys).  
2. Restore dump al proyecto (o punto-in-time si disponible).  
3. Re-aplicar **solo** migraciones posteriores al punto de backup (orden [`sql-checklist.md`](./sql-checklist.md)).  
4. Smoke mínimo: login `/ops`, GET proyecto, lead insert.

---

## 2. Código — commit estable y tag

Antes de release:

```bash
git fetch origin
git log -1 --oneline   # commit de release
git tag -a v0.7.0-b7 -m "AltivoxAI B0-B7 production candidate"
git push origin v0.7.0-b7
```

| Artefacto | Uso |
|-----------|-----|
| Tag `vX.Y.Z` | Punto de rollback de código |
| Deploy Vercel | Promote previous deployment |
| Branch `main` | Solo merges auditados |

---

## 3. Rollback SQL — orden inverso

**Solo en incidente.** Destruye datos del bloque.

| Orden rollback | Script | Efecto |
|----------------|--------|--------|
| 1 | `deploy-rollback.sql` | Drop Deploy Engine |
| 2 | `review-rollback.sql` | Drop Review Engine |
| 3 | `agent-runtime-rollback.sql` | Drop Agent Runtime |
| 4 | `project-engine-rollback.sql` | Drop Project Engine |
| 5 | `rbac-rollback.sql` | **⚠️** Restaura policies **abiertas** (authenticated amplio) — usar con cuidado; preferir restore dump |

**No hay** rollback dedicado para: `audit-events.sql`, `clientes.sql`, `site-settings.sql`, `n8n.sql`, `assign-superadmin.sql`.

Preferencia: **restore dump pre-migrate** > scripts rollback parciales.

---

## 4. Rollback aplicación

| Capa | Acción |
|------|--------|
| Vercel | Promote deployment anterior al tag |
| Env | Revertir variables rotas; no dejar `ALTIVOX_*_STORE=memory` por error |
| n8n | Pausar workflows que escriban CRM |
| DNS | Sin cambios habituales |

---

## 5. Checklist pre-migrate

- [ ] Backup Supabase verificado  
- [ ] Tag git creado  
- [ ] Scripts rollback en repo revisados  
- [ ] Ventana de mantenimiento comunicada  
- [ ] Owner con acceso Dashboard + Vercel + vault env  

---

## 6. Post-rollback verificación

- [ ] `/` responde  
- [ ] `/ops` login  
- [ ] Lead OK  
- [ ] Tablas esperadas presentes (o ausentes si rollback intencional)  
- [ ] Audit log de incidente en `docs` / ticket interno
