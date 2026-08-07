# Roadmap — Altivox OS

Orden por dependencias. Visión: [`product-vision.md`](./product-vision.md) · Flujo: [`flow.md`](./flow.md)

---

## Estado de bloques

| Bloque | Nombre | Estado |
|--------|--------|--------|
| **0** | Docs Altivox OS | Completado (+ sync en rama B1 · Prebloque B2-A) |
| **1** | Seguridad | Código cerrado (ops SQL/Upstash en entorno) |
| **B2-A** | Sync docs PE recorte | Este paso |
| **2** | Project Engine (código) | Pendiente OK implementación |
| 3+ | `/ops` UI, Review, motores, JARVIS… | Después |

---

## Fase 2 — Project Engine (recorte ADR-013)

**Solo:** `projects`, `project_versions`, `deliverables`, `project_events`  
**Estados:** draft → … → archived (ver flow)  
**APIs:** list/create, get/patch, transition, versions, deliverables, timeline  
**Sin:** review tokens, deployments, capabilities, agents, TR, workflows, JARVIS runtime

---

## Fases posteriores (resumen)

3. Shell `/ops` App Router  
4. JARVIS + resto de motores (interfaces)  
5. Agent runtime + service modules  
6. Review Engine + `/r/[token]`  
7. Entrega ZIP + Deployment Engine (vía Tool Registry)  
8. Perf/SEO escaparate  
9. Analítica / facturación  

Detalle motors: [`core-engines.md`](./core-engines.md).

---

## Principios

- Un bloque cada vez; docs = verdad; `can()` en mutaciones ops.  
- No anticipar tablas/APIs de motores futuros dentro del PE.
