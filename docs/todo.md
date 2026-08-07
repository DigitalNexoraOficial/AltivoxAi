# TODO — Backlog Altivox OS

Leyenda: **P0** bloqueante · **P1** alto · **P2** medio · **P3** mejora  
Regla: no código sin aprobación del bloque.

Visión: [`product-vision.md`](./product-vision.md) · Roadmap: [`roadmap.md`](./roadmap.md) · B4: [`ADR-014`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md)

---

## Bloque 0 — Docs

| ID | Tarea | Estado |
|----|-------|--------|
| T-000 | Realineación documental Altivox OS + ADR-010 | **done** |
| T-000b | Cinco motores del núcleo + ADR-011 | **done** |
| T-000c | Prebloque B2-A sync docs + ADR-013 | **done** |
| T-000d | Prebloque B4-A sync docs + ADR-014 | **done** |

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
| T-201 | Migrar leads/clientes desde HTML | gradual; **no** en B3 ni B4 |

---

## P1 — Bloque 4 — JARVIS + motores (interfaces) · **cerrado**

Contrato: [`ADR-014`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md).  
Código: `src/core/jarvis` + fronteras TypeScript de motores (sin runtimes/APIs/UI).

| ID | Tarea | Estado |
|----|-------|--------|
| T-300 | JARVIS Core (orquestador / caller → PE use-cases) | **done** |
| T-301 | Fronteras del resto de motores del núcleo | **done** (Workflow · Tool Registry · Memory · Capability Registry · Agent Manager boundary — **sin** runtimes) |

**Fuera de B4 (sigue pendiente en B5+):** Agent Runtime · Agent Manager runtime · Workflows ejecutables · Review Engine · Deployment Engine · service modules · tablas/APIs nuevas · stubs · chatbot público · reabrir B0–B3.

---

## P1 — Bloque 5 — Agent runtime + service modules

| ID | Tarea | Notas |
|----|-------|-------|
| T-306 | Agent Runtime + Agent Manager en ejecución | **No** B4 |
| T-307 | Primer service module plugin | **No** B4 |
| T-308 | Relabel/retirar `agentes.html` cosmético | Con B5 o cuando deje de confundir producto |

---

## P1 — Bloque 6 — Review Engine

| ID | Tarea | Notas |
|----|-------|-------|
| T-400 | `/r/[token]` + Review Engine | Sin internos; **no** B4 |

---

## P1 — Bloque 7 — Entrega + Deployment

| ID | Tarea | Notas |
|----|-------|-------|
| T-401 | ZIP delivery pipeline | **No** B4 |
| T-402 | Deploy adapters + confirmación (vía Tool Registry) | **No** B4 |

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
| T-302…T-305 como “implementar runtime en B4” | Runtimes = B5+; B4 solo fronteras (ADR-014) |
| Plataforma agentes pública | ADR-010 |
| JARVIS respuesta unificada al visitante | ADR-010 |
| Portal demo como producto cliente IA | Sustituido por `/r/[token]` (B6) |

---

## Hecho reciente

| Ítem | Ref |
|------|-----|
| Bloque 2 Project Engine | ADR-013 |
| Bloque 3 Ops Shell | `/ops` + proyectos UI |
| Prebloque B4-A | ADR-014 · sync docs |
| **Bloque 4** JARVIS Core + fronteras motores | ADR-014 · `src/core/jarvis` · **cerrado** |
