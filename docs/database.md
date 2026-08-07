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
           projects (Project Engine)
              │
     capabilities[]  (Capability Registry)
              │
     workflows / runs (Workflow Engine)
              │
     agent_runs → tools via Tool Registry
              │
     memory_records (Memory Engine — única)
              │
     versions · review_tokens · deliverables · deployments
```

### Tablas objetivo (conceptual)

| Tabla | Rol / motor |
|-------|-------------|
| `leads` / `clientes` | Captación / CRM |
| `projects` | **Project Engine** |
| `project_capabilities` | **Capability Registry** |
| `workflows` / `workflow_runs` | **Workflow Engine** |
| `agent_definitions` | Catálogo privado |
| `agent_runs` | Ejecución |
| `tool_adapters` / audit tool | **Tool Registry** |
| `memory_records` | **Memory Engine** |
| `project_versions` · `review_*` · `deliverables` · `deployments` | **Project Engine** |
| `service_modules` | Plugins de servicio |
| `event_log` | Bus / audit |
| `site_settings` | Marketing público |

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
