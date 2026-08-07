# Producción SQL — checklist go-live (no auto-ejecutar)

**REGLA:** este agente **no** ejecuta migraciones en Supabase producción.

Orden y detalle: [`sql-checklist.md`](./sql-checklist.md) · [`go-live-sql-check.md`](./go-live-sql-check.md) · [`backup-plan.md`](./backup-plan.md)

## Orden

1. foundation (`leads` + `clientes.sql` + `site-settings.sql`)  
2. `audit-events.sql`  
3. `rbac.sql`  
4. `assign-superadmin.sql` (email real)  
5. `project-engine.sql`  
6. `agent-runtime.sql`  
7. `review.sql`  
8. `deploy.sql`  

## Antes de ejecutar (ops)

- [ ] Backup Supabase  
- [ ] Proyecto Supabase correcto confirmado  
- [ ] Fecha anotada  
- [ ] Rollback scripts revisados  
- [ ] **Nunca** re-aplicar `auth-admin-only.sql` tras `rbac.sql`
