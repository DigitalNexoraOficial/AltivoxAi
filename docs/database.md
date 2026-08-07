# Base de datos — Altivox OS

---

## 1. As-is (producción + Bloques 1–6)

```
auth.users (+ app_metadata.role)
leads
clientes
site_settings
audit_events          ← técnico (Bloque 1)
projects              ← dominio PE (Bloque 2)
project_versions
deliverables
project_events        ← dominio PE (no mezclar con audit)
+ Agent Runtime (Bloque 5 · agent-runtime.sql)
+ Review Engine (Bloque 6 · review.sql)
+ Deploy Engine (Bloque 7 · deploy.sql): deployments, deployment_events
```

SQL relevante:

- B1: `supabase/sql/rbac.sql`, `audit-events.sql`, …  
- B2: `supabase/sql/project-engine.sql`  
- B5: `supabase/sql/agent-runtime.sql`  
- B6: `supabase/sql/review.sql`  
- B7: `supabase/sql/deploy.sql` (rollback: `deploy-rollback.sql`)  
- B2 **requiere** helpers `altivox_is_staff` / `altivox_role_in` del Bloque 1.

Orden: `audit-events.sql` → `rbac.sql` → `project-engine.sql` → `agent-runtime.sql` → `review.sql` → `deploy.sql`.

---

## 2. Bloque 2 — Project Engine (recorte)

Cuatro tablas. **Nada más** en este bloque.

```
clientes / leads
      │
      ▼
  projects
      ├── project_versions
      ├── deliverables
      └── project_events     (dominio; append-only)
```

| Tabla | Contenido |
|-------|-----------|
| `projects` | Agregado: `service_type`, `status` (estados B2), FKs opcionales a cliente/lead, metadata de negocio. **Sin** `required_capabilities`, **sin** agent ids. |
| `project_versions` | Versionado del trabajo (`label` único por proyecto) |
| `deliverables` | Artefactos (refs/metadata) por proyecto/versión |
| `project_events` | Timeline de **dominio** únicamente |

Estados `projects.status`:  
`draft` · `planning` · `in_progress` · `qa` · `review` · `approved` · `delivered` · `maintenance` · `cancelled` · `archived`  

`review` = **fase** del proyecto. **No** implica tablas de portal ni tokens (ADR-016).

Detalle: [`ADR-013`](./adr/ADR-013-project-engine.md), [`flow.md`](./flow.md).

### Explicitamente NO en Bloque 2

`review_tokens` · `review_comments` · `deployments` · `project_capabilities` · `workflows` · `agent_*` · `tool_*` · `memory_records`

---

## 3. Horizonte por bloque (sin inventar schemas)

| Bloque | Persistencia |
|-------|----------------|
| **4 · cerrado** | ADR-014: **ninguna** tabla nueva |
| **5 · cerrado** | ADR-015: Agent Runtime / Memory mínima de runs (`agent-runtime.sql`) — **sin** `review_tokens` ni `deployments` |
| **6 · cerrado** | ADR-016: `reviews`, `review_tokens`, `review_deliverables`, `review_comments`, `review_events` |
| **7 · cerrado** | ADR-017: `deployments` · `deployment_events` (config/deliverables en JSONB del deployment) |

**Fuera de B6 también:** Workflow runtime store · Tool Registry de vendors · `required_capabilities` en `projects` · Memory KB corporativa · reescritura del PE.

Ver [`ADR-016`](./adr/ADR-016-bloque-6-review-engine.md).  
Sin reescribir el core de `projects` (ADR-013). Agent Runtime permanece aislado (ADR-015).

---

## 4. RLS + integridad (B2)

- Staff: políticas por rol alineadas a permisos `project.*` / `deliverable.generate`.  
- Sin acceso anon a tablas PE.  
- `project_events`: select + insert staff; sin update/delete autenticado (append-only).  
- **`projects.status`:** no actualizable por `UPDATE` directo.  
  - Grants de columna a `authenticated` excluyen `status`.  
  - Trigger `trg_projects_status_guard` bloquea cambios salvo flag de sesión.  
  - Único camino: RPC `altivox_pe_transition` (lock optimista `WHERE status = from` + evento en la misma TX).  
- **Deliverables:** trigger exige `version_id` del mismo `project_id`.  
- Mutaciones de dominio atómicas vía RPC (`altivox_pe_create_project`, `_update_meta`, `_transition`, `_create_version`, `_register_deliverable`).  
- APIs del PE llaman RPC con **service role** tras `can()`; RLS sigue protegiendo acceso JWT directo.  
- Review por token: app valida hash/expiración/revocación (ADR-016). Emisión Ops vía `review.create` / `review.revoke`.

---

## 5. Auditoría

| Store | Uso |
|-------|-----|
| `project_events` | Dominio del proyecto |
| `audit_events` | Técnico (authz, API, rate limit, errores) |
| Persistencia Review (B6) | Sesión cliente / tokens / comentarios / eventos |
| Persistencia Agent Runtime (B5) | Runs / facts mínimos — **interno** |
| Persistencia Deploy (B7) | Deployments / eventos / package_uri |
