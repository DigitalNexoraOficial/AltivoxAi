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

## 2. As-is (implementado · Bloque 1 incluido)

| Ruta | Notas |
|------|-------|
| `POST /api/lead` | Captura + score + n8n |
| `POST /api/chat` | Chat comercial |
| `POST /api/n8n` | Secret o humano con `n8n.*` |
| `GET /api/site-settings` | Anon key only |
| `GET/POST/DELETE /api/ops/session` | Cookie transporte + whoami |
| `POST /api/ops/site-settings` | `can(settings.write)` + JWT usuario |

---

## 3. Bloque 2 — Project Engine (contrato; código pendiente)

Mutaciones vía Project Engine + `can(subject, action, resource)`.

| Método | Ruta |
|--------|------|
| POST, GET | `/api/ops/projects` |
| GET, PATCH | `/api/ops/projects/[id]` |
| POST | `/api/ops/projects/[id]/transition` |
| POST | `/api/ops/projects/[id]/versions` |
| POST | `/api/ops/projects/[id]/deliverables` |
| GET | `/api/ops/projects/[id]/timeline` |

**No en B2:** `/api/review/*`, deploy endpoints, capabilities, workflows, tools, memory, agent runs.

---

## 4. Horizonte (diferido)

Workflow run · capability assign · tool invoke · memory · review token APIs · deploy — ver [`core-engines.md`](./core-engines.md).

---

## 5. Eventos

Dominio PE: [`flow.md`](./flow.md) §6 (fase B2).  
Técnico: `audit_events`.
