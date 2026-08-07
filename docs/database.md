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

## 3. Horizonte (fuera de B2 — no implementar ahora)

Capability Registry, Workflow, Tool Registry, Memory, agents, review tokens, deployments — ver [`core-engines.md`](./core-engines.md).  
Se añadirán en sus bloques sin reescribir el core de `projects`.

---

## 4. RLS (B2)

- Staff: políticas por rol alineadas a permisos `project.*` / `deliverable.generate` (como leads/clientes).  
- Sin acceso anon a tablas PE.  
- `project_events`: select + insert staff; sin update/delete autenticado (append-only).  
- Review por token: N/A hasta Review Engine.  
- APIs del PE persisten con **service role** tras `can()`; RLS protege acceso directo con JWT de usuario.

---

## 5. Auditoría

| Store | Uso |
|-------|-----|
| `project_events` | Dominio del proyecto |
| `audit_events` | Técnico (authz, API, rate limit, errores) |
