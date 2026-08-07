# TODO — Backlog Altivox OS

Leyenda: **P0** bloqueante · **P1** alto · **P2** medio · **P3** mejora  
Regla: no código sin aprobación del bloque.

Visión: [`product-vision.md`](./product-vision.md) · Roadmap: [`roadmap.md`](./roadmap.md)

---

## Bloque 0 — Docs

| ID | Tarea | Estado |
|----|-------|--------|
| T-000 | Realineación documental Altivox OS + ADR-010 | **done** |
| T-000b | Cinco motores del núcleo + ADR-011 | **done** |

---

## P0 — Seguridad (Bloque 1 código)

| ID | Tarea | Notas |
|----|-------|-------|
| T-001 | RBAC SuperAdmin/Admin/Editor/Agent/User | OS + legacy admin |
| T-002 | Rate limit durable lead + chat público | Upstash |
| T-003 | Authz servidor en `/api/n8n` por rol | |
| T-005 | Quitar fallback service role site-settings | |
| T-006 | Middleware rutas OS/admin legacy | |
| T-004 | Sync WhatsApp site_settings prod | Ops manual |

---

## P0/P1 — Dominio ciclo de vida (Fase 2)

| ID | Tarea | Notas |
|----|-------|-------|
| T-100 | Schema `projects` + estados oficiales | flow.md |
| T-101 | `project_versions` + artefactos | |
| T-102 | `review_tokens` | |
| T-103 | `agent_definitions` + `agent_runs` | privados |
| T-104 | Event log / audit | |
| T-105 | Interfaces módulo de servicio | core vs plugins |

---

## P1 — Altivox OS UI (Fase 3)

| ID | Tarea | Notas |
|----|-------|-------|
| T-200 | Shell `/ops` App Router | Centro operaciones |
| T-201 | Migrar leads/clientes desde HTML | gradual |
| T-202 | Pantallas Proyectos / JARVIS stub | |

---

## P1 — JARVIS + agentes (Fases 4–5)

| ID | Tarea | Notas |
|----|-------|-------|
| T-300 | JARVIS Core como caller de motores | core-engines.md |
| T-301 | Project Engine | |
| T-302 | Workflow Engine | |
| T-303 | Tool Registry | |
| T-304 | Memory Engine | |
| T-305 | Capability Registry | |
| T-306 | Agent Manager registro en caliente | |
| T-307 | Primer service module plugin | |
| T-308 | Relabel/retirar `agentes.html` cosmético | |

---

## P1 — Review + entrega (Fases 6–7)

| ID | Tarea | Notas |
|----|-------|-------|
| T-400 | `/r/[token]` | sin internos |
| T-401 | ZIP delivery pipeline | |
| T-402 | Deploy adapters + confirmación | |

---

## P2 — Escaparate público

| ID | Tarea | Notas |
|----|-------|-------|
| T-015 | Gate Three móvil | perf |
| T-014 | Dead code Three/FX/clsx | |
| T-040–T-044 | SEO | seo.md |
| T-031–T-032 | a11y forms/modales | |

---

## P3

| ID | Tarea | Notas |
|----|-------|-------|
| T-053 | CI lint+build+smoke | |
| T-500 | Facturación stub | |
| T-054 | Analytics | |

---

## Obsoleto (no hacer)

| ID antiguo | Motivo |
|------------|--------|
| T-023 Chat → tools agentes OS | Viola aislamiento público/OS |
| Plataforma agentes pública | ADR-010 |
| JARVIS respuesta unificada al visitante | ADR-010 |
| Portal demo como producto cliente IA | Sustituido por `/r/[token]` |

---

## Hecho reciente

| Ítem | Ref |
|------|-----|
| Docs pre-pivot | PR #5 base |
| Bloque 0 Altivox OS docs | este cambio |
| WhatsApp número | PR #4 (paralelo) |
