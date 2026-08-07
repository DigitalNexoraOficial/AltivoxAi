# API — Altivox OS

Tres familias alineadas a las tres superficies.

---

## 1. Mapa

| Familia | Prefijo | Auth | Uso |
|---------|---------|------|-----|
| Pública | `/api/lead`, `/api/chat`, `/api/site-settings`, `/api/ig-image` | Anónima + rate limit | Captación |
| OS | `/api/ops/*` | Sesión + `can()` | Centro de operaciones |
| Review | `/api/review/*` | Token de review | **Contrato ADR-016 · no implementado** |
| Bridge | `/api/n8n` | Secret o JWT+perm | Automatización |

---

## 2. As-is (implementado · Bloques 1–5)

### 2.1 Público + sesión + PE

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

### 2.2 Agent Runtime (Bloque 5 · ADR-015)

| Ruta | Notas |
|------|-------|
| `/api/ops/agents*` | registro/resolución Agent Manager · `can()` |
| `/api/ops/agent-runs*` | ciclo de vida de runs · `can()` |

Agentes = **solo OS**. No hay APIs de agentes en superficie Review ni pública.

---

## 3. Horizonte por bloque

| Bloque | Contrato | APIs |
|--------|----------|------|
| **4 · cerrado** | ADR-014 | Ninguna API nueva (caller in-process) |
| **5 · cerrado** | ADR-015 | `/api/ops/agents*` · `/api/ops/agent-runs*` (implementado) |
| **6** | ADR-016 | `/api/review/*` + emisión/revocación desde Ops — **no implementado**; rutas concretas en bloque de código |
| **7** | Deploy | endpoints de deploy/ZIP — **fuera de B6** |

**Fuera de B6:** Workflow run completo · Tool vendors de entrega · deploy · ZIP · agentes en portal.

Detalle: [`ADR-016`](./adr/ADR-016-bloque-6-review-engine.md) · [`flow.md`](./flow.md).

---

## 4. Eventos

Dominio PE: [`flow.md`](./flow.md) §7.  
Técnico: `audit_events`.  
Review (B6): persistencia propia del Review Engine — **aún no**.
