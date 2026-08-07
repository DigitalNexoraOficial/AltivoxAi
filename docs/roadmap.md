# Roadmap — Altivox OS

Orden por dependencias. Visión: [`product-vision.md`](./product-vision.md) · Flujo: [`flow.md`](./flow.md)  
Contrato Bloque 4: [`ADR-014`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md)

---

## Estado de bloques

| Bloque | Nombre | Estado |
|--------|--------|--------|
| **0** | Docs Altivox OS | Completado |
| **1** | Seguridad | Completado (código; ops SQL/Upstash en entorno) |
| **B2-A** | Sync docs PE recorte | Completado |
| **2** | Project Engine | **Cerrado** (ADR-013 · código + harden post-auditoría) |
| **3** | Shell `/ops` App Router | **Cerrado** (UI Proyectos + puente HTML legacy) |
| **B4-A** | Sync docs JARVIS + motores (interfaces) | **Completado** (ADR-014) |
| **4** | JARVIS + resto de motores (interfaces) | Pendiente de **aprobación de implementación** |
| **5** | Agent runtime + service modules | Pendiente (después de B4) |
| **6** | Review Engine + `/r/[token]` | Pendiente (después de B5) |
| **7** | Entrega ZIP + Deployment Engine | Pendiente (después de B6) |

---

## Fase 2 — Project Engine (cerrada)

**Solo:** `projects`, `project_versions`, `deliverables`, `project_events`  
APIs `/api/ops/projects*` · sin review/deploy/capabilities/agents.

---

## Fase 3 — Ops Shell (cerrada)

- `src/app/ops` — layout, dashboard, nav, sesión/logout  
- Proyectos UI → solo APIs B2  
- CRM / Clientes / Ajustes → enlaces HTML (ADR-001)  
- `noindex` en `/ops`

---

## Fase 4 — JARVIS + resto de motores (interfaces)

**Contrato:** [`ADR-014`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md)

**Qué significa (sin cambiar el orden del roadmap):**

- Fronteras de orquestación de **JARVIS** (director / caller de motores).  
- Resto de motores del núcleo (**Workflow**, **Tool Registry**, **Memory**, **Capability Registry**) + **Agent Manager** como fronteras nombradas.  
- «Interfaces» = contratos de responsabilidad entre piezas — **no** runtimes.

**No es Fase 4:** Agent runtime · runtimes de motores · Review · Deploy · service modules · tablas/APIs nuevas · stubs.

*Implementación de código: solo tras OK explícito. B4-A solo sincronizó docs.*

---

## Fase 5 — Agent runtime + service modules

- Ejecución de agentes (Agent Runtime).  
- Primeros **service modules** / plugins.  
- Depende de fronteras B4; no anticipar en B4.

---

## Fase 6 — Review Engine + `/r/[token]`

- Tokens de revisión, comentarios, portal cliente.  
- Sin agentes/prompts/credenciales en el portal.

---

## Fase 7 — Entrega ZIP + Deployment Engine

- Empaquetado / entrega.  
- Deployment Engine **vía Tool Registry** (cuando el registry tenga runtime).

---

## Fases posteriores (resumen)

8. Perf/SEO escaparate  
9. Analítica / facturación  
(+ migración CRM HTML → App Router cuando toque)

Detalle motors: [`core-engines.md`](./core-engines.md).

---

## Principios

- Un bloque cada vez; docs = verdad; `can()` en mutaciones ops.  
- No anticipar tablas/APIs de motores futuros.  
- No stubs ni simulaciones de motores.
