# Base de datos — Altivox OS

---

## 1. As-is (producción + Bloque 1 + Bloque 2)

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
```

SQL relevante:

- B1: `supabase/sql/rbac.sql`, `audit-events.sql`, …  
- B2: `supabase/sql/project-engine.sql` (rollback: `project-engine-rollback.sql`)  
- B2 **requiere** helpers `altivox_is_staff` / `altivox_role_in` del Bloque 1.

Orden de aplicación en un entorno nuevo: `audit-events.sql` → `rbac.sql` → `project-engine.sql` (más `assign-superadmin.sql` según ops).

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

Detalle: [`ADR-013`](./adr/ADR-013-project-engine.md), [`flow.md`](./flow.md).

### Explicitamente NO en Bloque 2

`review_tokens` · `review_comments` · `deployments` · `project_capabilities` · `workflows` · `agent_*` · `tool_*` · `memory_records`

---

## 3. Horizonte (fuera de B2 — y fuera de B4)

Bloque 4 (**ADR-014**) es corte de **interfaces / fronteras**: **no** añade tablas nuevas.

Capability Registry, Workflow, Tool Registry, Memory, agents, review tokens, deployments — ver [`core-engines.md`](./core-engines.md).  
Runtimes y persistencia asociada: Bloques **5–7**, sin reescribir el core de `projects`.

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
- Review por token: N/A hasta Review Engine.

---

## 5. Auditoría

| Store | Uso |
|-------|-----|
| `project_events` | Dominio del proyecto |
| `audit_events` | Técnico (authz, API, rate limit, errores) |
