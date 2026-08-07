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
| OS | `/ops` (**implementado** · Bloque 3) |
| Review | `/r/[token]` (**implementado** · ADR-016 · Bloque 6) |
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
9. Fase PE `review` ≠ portal `/r/[token]` (ADR-016).

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
| **ADR-014** | **Bloque 4 — JARVIS + motores (interfaces)** | **Aceptado · implementado** — [`adr/ADR-014-bloque-4-jarvis-motores-interfaces.md`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md) |
| **ADR-015** | **Bloque 5 — Agent Runtime + service modules (recorte)** | **Aceptado · implementado** — [`adr/ADR-015-bloque-5-agent-runtime.md`](./adr/ADR-015-bloque-5-agent-runtime.md) |
| **ADR-016** | **Bloque 6 — Review Engine + `/r/[token]` (recorte)** | **Aceptado · implementado** — [`adr/ADR-016-bloque-6-review-engine.md`](./adr/ADR-016-bloque-6-review-engine.md) |
| **ADR-017** | **Bloque 7 — Deploy Engine + ZIP (recorte)** | **Aceptado · solo docs (B7-A)** — [`adr/ADR-017-bloque-7-deploy-engine.md`](./adr/ADR-017-bloque-7-deploy-engine.md) |

### ADR-005 (enmienda 2026-08-07)

El chat público permanece como MVP de captación con allowlist de tonos.  
**No** evoluciona a JARVIS ni a Agent Manager. Esas capacidades viven solo en `/ops`.

---

## 4. Tres superficies (fijo)

1. Web pública  
2. Altivox OS `/ops`  
3. Portal revisión `/r/[token]` — **implementado** (ADR-016)

---

## 5. Principio modular (fijo)

El núcleo no se modifica para un servicio nuevo.  
Nuevos servicios = módulos con interfaces (capabilities, workflows, QA, entregable, deploy).

### 5.1 Motores del núcleo (ADR-011 + fases)

Visión: cinco motores.  
**Dominio en código:** Project Engine recortado (ADR-013 · Bloque 2 cerrado).  
**UI OS:** shell `/ops` (Bloque 3) consume PE; CRM sigue en HTML temporal.  
**Bloque 4 (cerrado · ADR-014):** JARVIS Core (`src/core/jarvis`) = orquestador/caller interno → use-cases PE.  
Motores Workflow / Tool Registry / Memory / Capability (+ Agent Manager boundary) = interfaces TypeScript en B4.  
**Bloque 5 (cerrado · ADR-015):** Agent Runtime + Agent Manager runtime + módulo `web` + Tool/Memory/Capability **mínimos** + APIs ops agentes/runs.  
**Bloque 6 (cerrado · ADR-016):** Review Engine + `/r/[token]` + tokens + APIs.  
**Bloque 7 (contrato · ADR-017 · B7-A):** Deploy Engine + ZIP (sin providers externos en el recorte inicial) — **no implementado**.  
Spec: [`core-engines.md`](./core-engines.md).

---

## 6. Estructura ownership (to-be)

| Área | Path objetivo / actual | Owner |
|------|------------------------|-------|
| Pública | `src/app/(public)`, sections | Marketing + Frontend |
| OS | `src/app/ops` | OS + Frontend |
| Review | `src/app/r` + `src/core/review-engine` (B6) | Delivery |
| Core | `src/core/security`, `src/core/project-engine`, `src/core/jarvis`, `src/core/agent-runtime`, … | Arquitectura |
| Módulos | `src/modules/web` (B5) | Por servicio |
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
| 2026-08-07 | Prebloque B4-A: sync docs + ADR-014 (corte B4) | ADR-014 |
| 2026-08-07 | Sync residual B4-A: bots/deployment/performance/MEMORY/api | GO docs |
| 2026-08 | **Bloque 4:** JARVIS Core caller + fronteras motores (ADR-014) | cerrado |
| 2026-08-07 | Prebloque B5-A: sync docs + ADR-015 (corte B5) | ADR-015 |
| 2026-08 | **Bloque 5:** Agent Runtime + módulo web (ADR-015) | cerrado |
| 2026-08-07 | **Prebloque B6-A:** sync docs + ADR-016 (corte Review Engine) | ADR-016 |
| 2026-08 | **Bloque 6:** Review Engine + portal `/r/[token]` (ADR-016) | cerrado |
| 2026-08-07 | **Prebloque B7-A:** sync docs + ADR-017 (corte Deploy Engine) | ADR-017 |

---

## 8. Pendiente de implementación (no docs)

Ver [`todo.md`](./todo.md) y [`roadmap.md`](./roadmap.md).  
**Bloques 0–6 cerrados.** Prebloque **B7-A cerrado** (ADR-017).  
**Próximo bloque oficial de código:** Bloque 7 — Deploy Engine + ZIP — requiere **«OK implementar Bloque 7»**.  
**No** existe Deploy Engine implementado. Review = B6. Agent Runtime permanece interno.  
Ops entorno: aplicar SQL B1/B2/B5 + `review.sql` + Upstash en producción.  
Migración CRM UI = backlog UI aparte.

---

## 9. Cómo actualizar

1. Nueva decisión → ADR en `docs/adr/` + fila aquí.  
2. Merge relevante → una línea en §7.  
3. No duplicar specs: enlazar.
