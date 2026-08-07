# Flujo oficial — Altivox OS

**Referencia obligatoria** del ciclo de vida.  
Visión: [`product-vision.md`](./product-vision.md) · Motores: [`core-engines.md`](./core-engines.md)  
PE: [`ADR-013`](./adr/ADR-013-project-engine.md) · B4: [`ADR-014`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md) · B5: [`ADR-015`](./adr/ADR-015-bloque-5-agent-runtime.md) · B6: [`ADR-016`](./adr/ADR-016-bloque-6-review-engine.md) · B7: [`ADR-017`](./adr/ADR-017-bloque-7-deploy-engine.md)

---

## 1. Tres superficies

```
[Web pública]     captación
      │
      ▼
[Altivox OS /ops]  dominio + ops
      │
      ▼
[/r/[token]]       revisión cliente  ← implementado (Review Engine · Bloque 6)
      │
      ▼
[Altivox OS /ops]  entrega / deploy / mantenimiento  ← contrato ADR-017 · código pendiente (Bloque 7)
```

---

## 2. Ciclo de vida — visión a largo plazo

```
Lead → Cliente → Proyecto → Planificación → Capabilities → Agentes
  → Ejecución → QA → Versión → Review URL → Cambios ⟲ → Aprobación
  → Entrega → Deploy opcional → Mantenimiento
```

Ese ciclo completo requiere Capability Registry (runtime), Agent Runtime, Review Engine, Tool Registry (runtime), Workflow runtime y JARVIS operativo con agentes.  
**Cubierto en código:** PE (B2) · `/ops` (B3) · JARVIS Core (B4) · Agent Runtime + módulo web + Tool/Memory/Capability mínimos (B5).  
**B6 (ADR-016 · cerrado):** Review Engine + `/r/[token]` — **implementado**.  
**Contrato B7 (ADR-017 · B7-A):** Deploy Engine + ZIP — **no implementado**. Workflow runtime ≠ B5–B7.

---

## 3. Fase operativa actual (post Bloques 2–5)

### 3.1 Estados persistidos en `projects.status`

```
draft → planning → in_progress → qa → review
  → approved → delivered → maintenance
                 ↘ cancelled
→ archived
```

| Status | Significado hoy |
|--------|-----------------|
| `draft` | Proyecto creado |
| `planning` | Planificación |
| `in_progress` | Trabajo en curso (manual / OPS / agentes internos) |
| `qa` | Control de calidad (manual / OPS) |
| `review` | **Fase** “en revisión” — **no** es el portal `/r/[token]` |
| `approved` | Aprobado (marcado por OPS hoy; portal cliente = B6) |
| `delivered` | Entrega registrada (deliverables + transición) |
| `maintenance` | Mantenimiento |
| `cancelled` | Cancelado |
| `archived` | Archivado |

### 3.2 Transiciones: PE + Ops (+ agentes internos)

- Un humano (rol con `project.transition` / etc.) dispara cambios de estado vía **Project Engine** (`can` + API `/api/ops/projects/.../transition`).  
- Shell `/ops` (Bloque 3) es la UI de esos use-cases.  
- Agent Runtime (B5) ejecuta agentes **internos**; no emite URL de review ni deploy.  
- Emisión de URL `/r/[token]` vía Review Engine (B6).  
- **No** hay deploy a infraestructura del cliente (Bloque 7).

### 3.3 Versionado y entregables

- **ProjectVersion** — único mecanismo de versionado.  
- **Deliverable** — artefactos ligados a proyecto/versión (refs/metadata).  
- **ProjectEvent** — timeline de dominio (`project.created`, `project.status_changed`, …).  
- Técnico (authz deny, HTTP, rate limit) → solo `audit_events` (Bloque 1).

### 3.4 Qué no hace esta fase operativa

Deployments · Workflow runtime · Memory KB corporativa · Tool vendors de entrega.

---

## 4. Bloques 4–7 en el flujo

| Bloque | Aporta al flujo |
|--------|-----------------|
| **4 · cerrado** | JARVIS Core caller + fronteras; sin ejecución de agentes |
| **5 · cerrado** | Agent Runtime + service module; OPS/JARVIS lanzan runs **internos** |
| **6 · cerrado** | Review Engine + tokens + portal cliente |
| **7 · ADR-017** | Entrega ZIP + Deploy Engine (código pendiente; solo approved) |

La fase PE `review` puede existir **sin** portal. El portal es B6. Deploy es **solo** B7.

---

## 5. Captación (sin cambio de producto)

```
Landing → form/chat → POST /api/lead → leads → CRM admin
  → (OPS) Cliente → (OPS) Project Engine crea Proyecto
```

Chat público ≠ Agent Runtime ≠ Review Engine.

---

## 6. Portal `/r/[token]` — Bloque 6 (implementado · ADR-016)

- Sesión ligada a proyecto / versión / deliverables (snapshot allowlist).  
- Acciones: ver · comentar · solicitar cambios · aprobar · rechazar.  
- Auth por token (hash en DB, revocable + expiración); **sin** sesión staff.  
- **Sin** agentes, prompts, Memory, Tools ni credenciales.  
- Emisión/revocación desde Ops (`review.create` / `review.revoke`); JARVIS vía caller.  
- Integración PE: `getProject` al crear; **sin** auto-transición de `projects.status`.

**No** es Deploy (B7).

---

## 6b. Deploy Engine — Bloque 7 (contrato ADR-017)

Cuando exista (tras OK de código):

- Solo consume deliverables / reviews **approved** (nunca auto-deploy).  
- ZIP pipeline → artefacto interno.  
- Estados: `draft|queued|building|packaged|deploying|deployed|failed|cancelled`.  
- **Sin** providers externos en el recorte inicial (adapters = posterior).  
- JARVIS caller; Agent Runtime **no** ejecuta deploy.  
- PE/Review solo por use-cases públicos.

Detalle: [`ADR-017`](./adr/ADR-017-bloque-7-deploy-engine.md).

---

## 7. Eventos de dominio (Project Engine B2)

Ejemplos válidos en `project_events`:

- `project.created`  
- `project.updated`  
- `project.status_changed`  
- `project.version_created`  
- `project.deliverable_registered`  
- `project.archived` / `project.cancelled`

Eventos de agentes → B5 (persistencia Agent Runtime).  
Eventos de review → `review_events` (B6).  
Eventos de deploy → B7 (`deployments` / eventos Deploy — aún no).

---

## 8. Compatibilidad código actual

- Embudo real: leads + clientes + admin HTML + seguridad B1.  
- Project Engine: **implementado** (ADR-013).  
- Shell `/ops`: **implementado** (B3).  
- **JARVIS Core:** implementado (B4) — caller PE (+ agentes B5); **no** chatbot.  
- **Agent Runtime:** **implementado** (ADR-015) — **interno**; aislado del portal.  
- **Review Engine:** **implementado** (ADR-016) — portal `/r/[token]`.  
- **Deploy Engine:** **no** implementado — contrato ADR-017 (B7-A).  
- No fingir en la web pública que el chat son agentes OS.
