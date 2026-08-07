# Flujo oficial — Altivox OS

**Referencia obligatoria** del ciclo de vida.  
Visión: [`product-vision.md`](./product-vision.md) · Motores: [`core-engines.md`](./core-engines.md) · PE: [`ADR-013`](./adr/ADR-013-project-engine.md)

---

## 1. Tres superficies

```
[Web pública]     captación
      │
      ▼
[Altivox OS /ops]  dominio + ops
      │
      ▼
[/r/[token]]       revisión cliente  ← diferido (Review Engine)
      │
      ▼
[Altivox OS /ops]  entrega / deploy / mantenimiento
```

---

## 2. Ciclo de vida — visión a largo plazo

```
Lead → Cliente → Proyecto → Planificación → Capabilities → Agentes
  → Ejecución → QA → Versión → Review URL → Cambios ⟲ → Aprobación
  → Entrega → Deploy opcional → Mantenimiento
```

Ese ciclo completo requiere Capability Registry, Agent Runtime, Review Engine, Tool Registry y JARVIS. **Aún no están implementados.**

---

## 3. Fase actual (Bloque 2 — Project Engine)

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
| `in_progress` | Trabajo en curso (manual / OPS) |
| `qa` | Control de calidad (manual / OPS) |
| `review` | **Fase** “en revisión” — sin tokens ni portal todavía |
| `approved` | Aprobado (marcado por OPS) |
| `delivered` | Entrega registrada (deliverables + transición) |
| `maintenance` | Mantenimiento |
| `cancelled` | Cancelado |
| `archived` | Archivado |

### 3.2 Transiciones: manuales vía OPS

Hasta existir Workflow Engine y JARVIS runtime:

- Un humano (rol con `project.transition` / etc.) dispara cambios de estado vía **Project Engine** (`can` + API `/api/ops/projects/.../transition`).  
- No hay asignación automática de agentes ni pipelines.  
- No hay emisión de URL `/r/[token]`.  
- No hay deploy a infraestructura del cliente.

### 3.3 Versionado y entregables

- **ProjectVersion** — único mecanismo de versionado.  
- **Deliverable** — artefactos ligados a proyecto/versión (refs/metadata).  
- **ProjectEvent** — timeline de dominio (`project.created`, `project.status_changed`, …).  
- Técnico (authz deny, HTTP, rate limit) → solo `audit_events` (Bloque 1).

### 3.4 Qué no hace esta fase

Capabilities en el proyecto · agent runs · review tokens/comments · deployments · Memory Engine · Tool Registry.

---

## 4. Captación (sin cambio de producto)

```
Landing → form/chat → POST /api/lead → leads → CRM admin
  → (OPS) Cliente → (OPS) Project Engine crea Proyecto
```

Chat público ≠ Agent Runtime.

---

## 5. Portal `/r/[token]` — diferido

Reglas de producto (cuando exista Review Engine): entregable + comentarios + cambios/aprobación; sin agentes/prompts/credenciales.  
**No forma parte del Bloque 2.**

---

## 6. Eventos de dominio (Project Engine B2)

Ejemplos válidos en `project_events`:

- `project.created`  
- `project.updated`  
- `project.status_changed`  
- `project.version_created`  
- `project.deliverable_registered`  
- `project.archived` / `project.cancelled`

Eventos de agentes, review token, deploy → bloques futuros.

---

## 7. Compatibilidad código actual

- Embudo real: leads + clientes + admin HTML + seguridad B1.  
- Project Engine: **pendiente de implementación** (tras este sync docs).  
- No fingir en la web pública que el chat son agentes OS.
