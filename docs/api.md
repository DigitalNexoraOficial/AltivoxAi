# API — Altivox OS

Tres familias alineadas a las tres superficies.

---

## 1. Mapa

| Familia | Prefijo | Auth | Uso |
|---------|---------|------|-----|
| Pública | `/api/lead`, `/api/chat`, `/api/site-settings`, `/api/ig-image` | Anónima + rate limit | Captación |
| OS | `/api/ops/*` | Sesión + `can()` | Centro de operaciones |
| Review | `/api/review/*` | Token | **Diferido** (Review Engine) |
| Bridge | `/api/n8n` | Secret o JWT+perm | Automatización |

---

## 2. As-is (implementado · Bloque 1 + Bloque 2)

| Ruta | Notas |
|------|-------|
| `POST /api/lead` | Captura + score + n8n |
| `POST /api/chat` | Chat comercial |
| `POST /api/n8n` | Secret o humano con `n8n.*` |
| `GET /api/site-settings` | Anon key only |
| `GET/POST/DELETE /api/ops/session` | Cookie transporte + whoami |
| `POST /api/ops/site-settings` | `can(settings.write)` + JWT usuario |
| `POST /api/ops/projects` | `can(project.create)` → createProject |
| `GET /api/ops/projects` | `can(project.read)` → listProjects |
| `GET /api/ops/projects/[id]` | getProject |
| `PATCH /api/ops/projects/[id]` | `can(project.update)` → updateProjectMeta |
| `POST /api/ops/projects/[id]/transition` | `project.transition` / `project.approve` |
| `POST /api/ops/projects/[id]/versions` | createVersion |
| `POST /api/ops/projects/[id]/deliverables` | `deliverable.generate` |
| `GET /api/ops/projects/[id]/timeline` | listTimeline (`project_events`) |

Mutaciones PE: use-cases en `src/core/project-engine` + `can(subject, action, resource)`.  
Dominio → `project_events`. Técnico → `audit_events`.

**No en B2 ni en B4:** `/api/review/*`, deploy endpoints, capabilities, workflows, tools, memory, agent runs.

---

## 3. Horizonte (diferido · no Bloque 4)

Bloque 4 (**ADR-014**) es corte de **interfaces / fronteras**: **no** añade APIs nuevas.

Workflow run · capability assign · tool invoke · memory · agent runs · review token APIs · deploy — bloques **5–7**. Ver [`core-engines.md`](./core-engines.md) · [`ADR-014`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md).

---

## 4. Eventos

Dominio PE: [`flow.md`](./flow.md) §7.  
Técnico: `audit_events`.
