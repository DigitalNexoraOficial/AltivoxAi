# Base de datos — Altivox OS

---

## 1. As-is (producción + Bloque 1)

```
auth.users (+ app_metadata.role)
leads
clientes
site_settings
audit_events          ← técnico (Bloque 1)
```

SQL relevante: `supabase/sql/rbac.sql`, `audit-events.sql`, `clientes.sql`, `site-settings.sql`, …

---

## 2. Bloque 2 — Project Engine (único recorte de dominio a añadir)

Cuatro tablas nuevas. **Nada más** en este bloque.

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
| `project_versions` | Versionado del trabajo |
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

- Staff: políticas por rol alineadas a permisos `project.*` (como leads/clientes).  
- Sin acceso anon a tablas PE.  
- Review por token: N/A hasta Review Engine.

---

## 5. Auditoría

| Store | Uso |
|-------|-----|
| `project_events` | Dominio del proyecto |
| `audit_events` | Técnico (authz, API, rate limit, errores) |
