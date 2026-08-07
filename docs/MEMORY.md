# MEMORY — Memoria permanente Altivox OS

> Fuente de verdad narrativa. Si contradice el código, gana el código **y** se corrige MEMORY en el mismo ciclo de docs.  
> Visión de producto: [`product-vision.md`](./product-vision.md)

---

## 1. Identidad

| Campo | Valor |
|-------|-------|
| Producto interno | **Altivox OS** (Sistema Operativo de la empresa) |
| Marca comercial | AltivoxAi / Altivox AI |
| URL pública | https://www.altivoxai.es |
| OS (objetivo) | `/ops` |
| Review (objetivo) | `/r/[token]` |
| Repo | DigitalNexoraOficial/AltivoxAi |
| Owner | Xabier |
| Hosting | Vercel · Supabase · n8n |
| Idioma | ES-first |

---

## 2. Objetivos (vigentes)

1. Web pública = captación e información.  
2. Altivox OS = gestionar **toda** la actividad de la empresa.  
3. Ciclo de vida oficial Lead → … → Mantenimiento ([`flow.md`](./flow.md)).  
4. JARVIS = Director de Proyectos (orquestador); usa motores del núcleo; no chatbot.  
5. Agentes = privados; I/O solo Tool Registry; memoria solo Memory Engine.  
6. Capabilities antes que agent IDs (Capability Registry).  
7. Extensión por módulos/plugins e interfaces.  
8. Documentar → aprobar → implementar (por bloques).

---

## 3. ADRs

| ID | Título | Estado |
|----|--------|--------|
| ADR-001 | Dual stack landing Next + admin HTML | Temporal vigente |
| ADR-002 | Scoring leads solo servidor | Vigente |
| ADR-003 | n8n bus de ops, no CRM | Vigente |
| ADR-004 | site_settings jsonb | Vigente (marketing) |
| ADR-005 | Chat = personas prompt | Reformulado (comercial only) |
| ADR-006 | Three.js en home | Vigente; escaparate |
| ADR-007 | Document-first | Vigente |
| ADR-010 | Pivot Altivox OS | Aceptado |
| ADR-011 | Cinco motores del núcleo | Aceptado |
| ADR-012 | Security foundation | Aceptado — [`adr/ADR-012-security-foundation.md`](./adr/ADR-012-security-foundation.md) |
| **ADR-013** | **Project Engine B2 (recorte)** | **Aceptado · implementado** — [`adr/ADR-013-project-engine.md`](./adr/ADR-013-project-engine.md) |
| **ADR-014** | **Bloque 4 — JARVIS + motores (interfaces)** | **Aceptado · contrato documental** — [`adr/ADR-014-bloque-4-jarvis-motores-interfaces.md`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md) |

### ADR-005 (enmienda 2026-08-07)

El chat público permanece como MVP de captación con allowlist de tonos.  
**No** evoluciona a JARVIS ni a Agent Manager. Esas capacidades viven solo en `/ops`.

---

## 4. Tres superficies (fijo)

1. Web pública  
2. Altivox OS `/ops`  
3. Portal revisión `/r/[token]`  

---

## 5. Principio modular (fijo)

El núcleo no se modifica para un servicio nuevo.  
Nuevos servicios = módulos con interfaces (capabilities, workflows, QA, entregable, deploy).

### 5.1 Motores del núcleo (ADR-011 + fases)

Visión: cinco motores.  
**Dominio en código:** Project Engine recortado (ADR-013 · Bloque 2 cerrado).  
**UI OS:** shell `/ops` (Bloque 3) consume PE; CRM sigue en HTML temporal.  
**Bloque 4:** solo fronteras / interfaces de JARVIS + resto de motores (ADR-014) — **sin** runtimes ni Agent Runtime.  
**Bloque 5+:** Agent runtime, service modules, Review, Deploy.  
Spec: [`core-engines.md`](./core-engines.md).

---

## 6. Estructura ownership (to-be)

| Área | Path objetivo / actual | Owner |
|------|------------------------|-------|
| Pública | `src/app/(public)`, sections | Marketing + Frontend |
| OS | `src/app/ops` | OS + Frontend |
| Review | `src/app/r` (futuro) | Delivery |
| Core | `src/core/security`, `src/core/project-engine` | Arquitectura |
| Módulos | `src/modules` (futuro) | Por servicio |
| Admin legacy | `public/*.html` | Temporal |
| Docs | `docs/` | CTO / arquitectura |

---

## 7. Historial

| Fecha | Cambio | Ref |
|-------|--------|-----|
| 2026-08 | Hardening APIs, admin premium, site_settings | main |
| 2026-08-07 | Docs iniciales multiagente (pre-pivot) | `0550c03` |
| 2026-08-07 | **Bloque 0: pivot documental Altivox OS** | ADR-010 |
| 2026-08-07 | Ampliación núcleo: 5 motores oficiales | ADR-011 |
| 2026-08 | Bloque 1 seguridad (código) | ADR-012 · rama `cursor/bloque-1-security-4521` |
| 2026-08-07 | Prebloque B2-A: sync docs + ADR-013 PE recorte | docs |
| 2026-08 | Bloque 2 Project Engine (+ harden) | ADR-013 · cerrado |
| 2026-08 | Bloque 3 Ops Shell `/ops` + UI proyectos | cerrado |
| 2026-08-07 | Prebloque B4-A: sync docs + ADR-014 (corte B4) | este cambio |

---

## 8. Pendiente de implementación (no docs)

Ver [`todo.md`](./todo.md) y [`roadmap.md`](./roadmap.md).  
**Prebloque B4-A cerrado** (ADR-014). Bloque 4 de **código** solo tras OK explícito de implementación.  
Alcance B4 ≠ Agent runtime / Review / Deploy / módulos (eso es B5–B7).  
Migración CRM UI = backlog aparte, no B4.  
Ops entorno: aplicar SQL B1/B2 + Upstash en producción.

---

## 9. Cómo actualizar

1. Nueva decisión → ADR en `docs/adr/` + fila aquí.  
2. Merge relevante → una línea en §7.  
3. No duplicar specs: enlazar.
