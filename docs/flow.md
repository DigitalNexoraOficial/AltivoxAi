# Flujo oficial — Altivox OS

**Referencia obligatoria** del ciclo de vida.  
Visión: [`product-vision.md`](./product-vision.md) · Motores: [`core-engines.md`](./core-engines.md)  
PE: [`ADR-013`](./adr/ADR-013-project-engine.md) · B4: [`ADR-014`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md)

---

## 1. Tres superficies

```
[Web pública]     captación
      │
      ▼
[Altivox OS /ops]  dominio + ops
      │
      ▼
[/r/[token]]       revisión cliente  ← diferido (Review Engine · Bloque 6)
      │
      ▼
[Altivox OS /ops]  entrega / deploy / mantenimiento  ← diferido (Bloque 7)
```

---

## 2. Ciclo de vida — visión a largo plazo

```
Lead → Cliente → Proyecto → Planificación → Capabilities → Agentes
  → Ejecución → QA → Versión → Review URL → Cambios ⟲ → Aprobación
  → Entrega → Deploy opcional → Mantenimiento
```

Ese ciclo completo requiere Capability Registry (runtime), Agent Runtime, Review Engine, Tool Registry (runtime), Workflow runtime y JARVIS operativo con agentes.  
**Parcialmente cubierto:** JARVIS Core (B4) + PE (B2).  
**B5 (ADR-015):** Agent Runtime + módulos + Tool/Memory/Capability mínimos — **aún no en código**.  
Review/Deploy = B6/B7. Workflow runtime ≠ B5.

---

## 3. Fase operativa actual (post Bloques 2–3)

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

Hasta existir Workflow runtime y JARVIS operativo con motores en runtime:

- Un humano (rol con `project.transition` / etc.) dispara cambios de estado vía **Project Engine** (`can` + API `/api/ops/projects/.../transition`).  
- Shell `/ops` (Bloque 3) es la UI de esos use-cases.  
- No hay asignación automática de agentes ni pipelines.  
- No hay emisión de URL `/r/[token]` (Bloque 6).  
- No hay deploy a infraestructura del cliente (Bloque 7).

### 3.3 Versionado y entregables

- **ProjectVersion** — único mecanismo de versionado.  
- **Deliverable** — artefactos ligados a proyecto/versión (refs/metadata).  
- **ProjectEvent** — timeline de dominio (`project.created`, `project.status_changed`, …).  
- Técnico (authz deny, HTTP, rate limit) → solo `audit_events` (Bloque 1).

### 3.4 Qué no hace esta fase operativa

Capabilities en el proyecto · agent runs · review tokens/comments · deployments · Memory Engine runtime · Tool Registry runtime.

---

## 4. Bloque 4 y Bloque 5 en el flujo

| Bloque | Aporta al flujo |
|--------|-----------------|
| **4 · cerrado** | JARVIS Core caller + fronteras; sin ejecución de agentes |
| **5 · ADR-015** | Agent Runtime + service module; OPS/JARVIS pueden lanzar runs internos |
| **6** | Review URL + comentarios cliente |
| **7** | Entrega ZIP + deploy opcional |

Bloque 5 **no** cambia el ciclo operativo manual del §3 por sí solo: las transiciones de proyecto siguen en PE; los agentes no reemplazan al humano OPS hasta que se cablee orquestación operativa bajo ADR-015.

---

## 5. Captación (sin cambio de producto)

```
Landing → form/chat → POST /api/lead → leads → CRM admin
  → (OPS) Cliente → (OPS) Project Engine crea Proyecto
```

Chat público ≠ Agent Runtime.

---

## 6. Portal `/r/[token]` — diferido (Bloque 6)

Reglas de producto (cuando exista Review Engine): entregable + comentarios + cambios/aprobación; sin agentes/prompts/credenciales.  
**No forma parte del Bloque 2 ni del Bloque 4.**

---

## 7. Eventos de dominio (Project Engine B2)

Ejemplos válidos en `project_events`:

- `project.created`  
- `project.updated`  
- `project.status_changed`  
- `project.version_created`  
- `project.deliverable_registered`  
- `project.archived` / `project.cancelled`

Eventos de agentes, review token, deploy → bloques futuros (5–7).

---

## 8. Compatibilidad código actual

- Embudo real: leads + clientes + admin HTML + seguridad B1.  
- Project Engine: **implementado** (ADR-013).  
- Shell `/ops`: **implementado** (B3).  
- **JARVIS Core:** implementado (B4) — caller PE; **no** chatbot.  
- **Agent Runtime:** **no** implementado — contrato ADR-015 (B5-A).  
- Review / deploy: diferidos B6/B7.  
- No fingir en la web pública que el chat son agentes OS.
