# Base de datos — Altivox OS

---

## 1. As-is (producción)

```
auth.users
leads  ←── anon insert; authenticated read/update (plano)
clientes
site_settings  (brand/hero/contact/flags/social)
automation_events (opcional)
```

SQL: `supabase/sql/*` (+ `chat-leads.sql` duplicado en root).

No existen: projects, review tokens, agent runs, módulos.

---

## 2. To-be — modelo alineado al ciclo de vida

```
auth.users (+ app_metadata.role)
    │
leads ──► clients (clientes)
              │
              ▼
           projects  ◄── service_module_id (plugin)
              │
     project_states / history (audit)
              │
     ┌────────┼────────┐
     ▼        ▼        ▼
agent_runs  versions  conversations
     │         │
     │         ▼
     │   review_tokens ──► portal /r/[token]
     │         │
     │         ▼
     │   deliverables / artifacts
     │         │
     │         ▼
     │   deployments
     ▼
agent_definitions (registro privado)
tool_registry / configs
event_log / memory_records
```

### Tablas objetivo (conceptual)

| Tabla | Rol en el flujo |
|-------|-----------------|
| `leads` | Lead |
| `clientes` | Cliente |
| `projects` | Proyecto + estado del ciclo oficial |
| `project_tasks` / plan | Planificación |
| `project_agents` | Asignación |
| `agent_definitions` | Catálogo privado |
| `agent_runs` | Ejecución + coste + logs |
| `qa_reports` | Control de calidad |
| `project_versions` | Versión candidata |
| `review_tokens` | URL privada |
| `review_comments` | Comentarios / cambios |
| `deliverables` | Entrega (ZIP refs) |
| `deployments` | Despliegue opcional |
| `maintenance_records` | Mantenimiento |
| `service_modules` | Plugins de tipo de servicio |
| `event_log` / `memory_records` | Memoria y auditoría |
| `site_settings` | Solo marketing público |

Estados de `projects` deben mapear 1:1 al ciclo en [`flow.md`](./flow.md).

---

## 3. RLS (to-be)

- Público: insert leads (restringido); read `site_settings`.  
- Staff: según rol (RBAC).  
- Review: **no** usa políticas de staff; acceso vía API que valida token y proyecta DTO seguro (sin joins a agentes/prompts).

---

## 4. Problemas conocidos as-is

- Sin roles; authenticated = poder total.  
- SQL duplicado.  
- Sin migraciones versionadas automatizadas.  
- Stub `jarvis-chat` en config.toml sin función.

---

## 5. Principio modular en datos

Nuevo tipo de servicio ≠ nuevas tablas en el núcleo si se puede evitar:  
usar `service_modules` + JSON/config + tablas de extensión namespaced por módulo (`module_<id>_*` solo si es imprescindible), registradas sin alterar el schema core de projects.
