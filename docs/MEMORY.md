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
4. JARVIS = Director de Proyectos (orquestador), no chatbot.  
5. Agentes = privados, extensibles sin tocar el núcleo.  
6. Extensión por **módulos/plugins** e interfaces.  
7. Documentar → aprobar → implementar (por bloques).

---

## 3. ADRs

| ID | Título | Estado |
|----|--------|--------|
| ADR-001 | Dual stack landing Next + admin HTML | Temporal vigente |
| ADR-002 | Scoring leads solo servidor | Vigente |
| ADR-003 | n8n bus de ops, no CRM | Vigente |
| ADR-004 | site_settings jsonb | Vigente (marketing) |
| ADR-005 | Chat = personas prompt | **Reformulado**: chat **comercial** only; no es runtime OS (ver ADR-010) |
| ADR-006 | Three.js en home | Vigente; prioridad escaparate, no OS |
| ADR-007 | Document-first | Vigente |
| **ADR-010** | **Pivot Altivox OS** | **Aceptado** — [`adr/ADR-010-altivox-os-pivot.md`](./adr/ADR-010-altivox-os-pivot.md) |

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
Nuevos servicios = módulos con interfaces (plan, agentes, QA, entregable, deploy).

---

## 6. Estructura ownership (to-be)

| Área | Path objetivo / actual | Owner |
|------|------------------------|-------|
| Pública | `src/app/(public)`, sections | Marketing + Frontend |
| OS | `src/app/ops` (futuro) | OS + Backend |
| Review | `src/app/r` (futuro) | Delivery |
| Core | `src/core` (futuro) | Arquitectura |
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

---

## 8. Pendiente de implementación (no docs)

Ver [`todo.md`](./todo.md) y [`roadmap.md`](./roadmap.md).  
Siguiente bloque de **código** tras validar Bloque 0: **Seguridad OS**.

---

## 9. Cómo actualizar

1. Nueva decisión → ADR en `docs/adr/` + fila aquí.  
2. Merge relevante → una línea en §7.  
3. No duplicar specs: enlazar.
