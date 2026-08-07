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
| T-000c | Prebloque B2-A sync docs + ADR-013 | **done** |

---

## P0 — Seguridad (Bloque 1)

| ID | Tarea | Estado |
|----|-------|--------|
| T-001…T-006 | RBAC, RLS, middleware, RL, n8n, settings | **done** (ops entorno pendiente) |

---

## P0 — Project Engine (Bloque 2)

| ID | Tarea | Estado |
|----|-------|--------|
| T-100…T-104 | Schema, use-cases, APIs, RLS/`can()` | **done** / cerrado |
| Harden post-auditoría | RPC atómicas, status guard, approve | **done** |

**Fuera de B2:** review_tokens, deployments, capabilities, agents, TR, workflows, JARVIS runtime.

---

## P0 — Ops Shell (Bloque 3)

| ID | Tarea | Estado |
|----|-------|--------|
| T-200 | Shell `/ops` App Router | **done** |
| T-200b | UI Proyectos (APIs B2) | **done** |
| T-200c | Puente legacy HTML CRM/Clientes/Ajustes | **done** |

---

## P1 — UI CRM App Router (posterior)

| ID | Tarea | Notas |
|----|-------|-------|
| T-201 | Migrar leads/clientes desde HTML | gradual; no en B3 |

---

## P1 — JARVIS + agentes (Fases 4–5)

| ID | Tarea | Notas |
|----|-------|-------|
| T-300 | JARVIS Core como caller de motores | core-engines.md |
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
| T-202 JARVIS stub en B3 | Prohibido fingir motores |
| Plataforma agentes pública | ADR-010 |
| JARVIS respuesta unificada al visitante | ADR-010 |
| Portal demo como producto cliente IA | Sustituido por `/r/[token]` |

---

## Hecho reciente

| Ítem | Ref |
|------|-----|
| Bloque 2 Project Engine | ADR-013 |
| Bloque 3 Ops Shell | `/ops` + proyectos UI |
