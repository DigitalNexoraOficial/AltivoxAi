# Smoke test E2E — producción / staging

Checklist **manual**. Ejecutar tras migraciones + env.  
Auth: usuario staff con `ops.access` (admin/operator según acción).

Base: `https://<dominio>` · Cookie ops vía `/login.html` o `/ops`.

---

## 0. Preflight

- [ ] `npm run test:core` OK en CI/local  
- [ ] SQL B1–B7 aplicadas ([`sql-checklist.md`](./sql-checklist.md))  
- [ ] Env prod ([`env-checklist.md`](./env-checklist.md))  
- [ ] Login staff → `/ops` accesible  
- [ ] GET `/` marketing OK  
- [ ] POST `/api/lead` con email válido → `{ ok: true }`  

---

## 1–3. Proyecto (Project Engine)

### 1. Crear proyecto

- [ ] UI `/ops/projects` **o** `POST /api/ops/projects` con Bearer  
- [ ] Respuesta 201/200 con `id`, `status: draft` (o equivalente)  
- [ ] Fila en `public.projects`

### 2. Crear versión

- [ ] `POST /api/ops/projects/[id]/versions`  
- [ ] Versión listable; `version_id` anotado

### 3. Añadir deliverable

- [ ] `POST /api/ops/projects/[id]/deliverables` (título + payload mínimo)  
- [ ] Deliverable visible en GET proyecto / lista  
- [ ] `deliverable_id` anotado

---

## 4–9. Review Engine + portal

### 4–5. Crear sesión + token

- [ ] `POST /api/ops/reviews` con `projectId` + `versionId`  
- [ ] Respuesta incluye **token plaintext una sola vez**  
- [ ] `token_hash` en DB; plaintext **no** persistido en claro  

### 6. Abrir portal

- [ ] Abrir `/r/<token>` **en ventana privada / sin cookie staff**  
- [ ] Contenido de deliverables snapshot visible  
- [ ] Headers / meta: `noindex`  
- [ ] Sin llamadas a `/api/ops/*` en Network

### 7. Comentar

- [ ] `POST /api/review/<token>/comments` (o UI)  
- [ ] Comentario listado; sin fuga de prompts/agentes

### 8. Pedir cambios

- [ ] `POST /api/review/<token>/changes`  
- [ ] Estado Review → `changes_requested` (o transición válida)

### 9. Aprobar / rechazar

Repetir con **nueva** sesión/token si el anterior quedó terminal:

- [ ] Approve → Review `approved`  
- [ ] **o** Reject → Review `rejected`  

### Confirmación crítica

- [ ] **`projects.status` NO cambia automáticamente** por approve/reject Review  
- [ ] Transición PE solo vía OPS/`can(project.transition|approve)` explícito  

---

## 10–12. Deploy Engine + ZIP

### 10. Crear deployment

- [ ] `POST /api/ops/deployments` (`projectId`, `versionId`)  
- [ ] Estado `draft` · fila en `deployments`

### 11. Ejecutar

- [ ] `POST /api/ops/deployments/[id]/execute`  
- [ ] Transición observada: `draft → queued → building → packaged` (sin vendors)

### 12. ZIP + historial

- [ ] `package_uri` / artefacto presente  
- [ ] ZIP legible (entradas deterministas esperadas)  
- [ ] Eventos en `deployment_events`  
- [ ] Cancel de un draft/queued funciona con `…/cancel` si se prueba

### Confirmaciones

- [ ] Cliente `/r` **no** puede crear/ejecutar deploy  
- [ ] Agent subject **no** puede `deploy.*`  
- [ ] Sin auto-deploy tras Review approve  

---

## Agentes (opcional smoke B5)

- [ ] Bootstrap/register agent (admin)  
- [ ] `POST /api/ops/agent-runs` → execute  
- [ ] Run `completed`/`failed` interno  
- [ ] Sin exposición en `/r` ni web pública  

---

## SEO / superficie

- [ ] `robots.txt` Disallow `/r`, `/legacy/`, `/ops`  
- [ ] Sitemap sin `/r` ni legacy  
- [ ] Legacy HTML requiere auth  

---

## Resultado

| Flujo | OK | Notas |
|-------|----|-------|
| Proyecto | ☐ | |
| Review | ☐ | PE intacto ☐ |
| Deploy ZIP | ☐ | |
| Lead / pública | ☐ | |
| Agentes | ☐ | |

**Firma ops:** _______________ **Fecha:** _______________
