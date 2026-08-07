# API — Altivox OS

Tres familias de API alineadas a las tres superficies.

---

## 1. Mapa

| Familia | Prefijo | Auth | Uso |
|---------|---------|------|-----|
| Pública | `/api/lead`, `/api/chat`, `/api/site-settings`, `/api/ig-image` | Anónima + rate limit | Captación / marketing |
| OS | `/api/ops/*` (objetivo) | Sesión + RBAC | Centro de operaciones |
| Review | `/api/review/*` (objetivo) | Token de revisión | Portal `/r/[token]` |
| Bridge | `/api/n8n` | Secret o JWT+rol | Automatización |

---

## 2. As-is (implementado)

| Ruta | Notas |
|------|-------|
| `POST /api/lead` | Captura + score servidor + n8n |
| `POST /api/chat` | Chat comercial (no OS agents) |
| `POST /api/n8n` | Bridge; hoy JWT sin rol fino |
| `GET /api/site-settings` | Merge settings marketing |
| `GET /api/ig-image` | Assets IG allowlisted |

Detalle de campos: código en `src/app/api/*/route.ts`.

---

## 3. To-be OS (no implementado)

Ejemplos de recursos (contratos a formalizar en Fase 2–4):

- `POST /api/ops/projects` — crear proyecto (JARVIS/humano)  
- `POST /api/ops/projects/:id/plan` — planificación  
- `POST /api/ops/projects/:id/assign` — asignación agentes  
- `POST /api/ops/projects/:id/runs` — disparar ejecución  
- `POST /api/ops/projects/:id/qa` — QA  
- `POST /api/ops/projects/:id/release-candidate` — versión  
- `POST /api/ops/projects/:id/review-link` — emitir token  
- `POST /api/ops/projects/:id/deliver` — ZIP  
- `POST /api/ops/projects/:id/deploy` — solicita deploy (requiere confirmación)  
- `GET /api/ops/agents` — catálogo privado  
- `GET /api/ops/events` — bus/audit  

Review:

- `GET /api/review/:token` — DTO seguro del entregable  
- `POST /api/review/:token/comments`  
- `POST /api/review/:token/request-changes`  
- `POST /api/review/:token/approve` | `reject`  

Respuestas review: **whitelist de campos**; nunca prompts, agent ids internos, costes, logs OS.

---

## 4. Eventos

Ver lista en [`flow.md`](./flow.md) §6. Emisión vía Event Bus interno; n8n consume subconjunto ops.

---

## 5. Deuda

- Helpers HTTP compartidos (`src/server`) — Bloque arquitectura/seguridad.  
- OpenAPI cuando existan `/api/ops` y `/api/review`.  
- Versionado `/api/v1` si hay clientes externos al OS.
