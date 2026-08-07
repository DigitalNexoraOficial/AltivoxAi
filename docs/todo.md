# TODO — Backlog Altivox OS

Leyenda: **P0** bloqueante · **P1** alto · **P2** medio · **P3** mejora  
Regla: no código sin aprobación del bloque.

Visión: [`product-vision.md`](./product-vision.md) · Roadmap: [`roadmap.md`](./roadmap.md)  
B4: [`ADR-014`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md) · B5: [`ADR-015`](./adr/ADR-015-bloque-5-agent-runtime.md) · B6: [`ADR-016`](./adr/ADR-016-bloque-6-review-engine.md)

---

## Bloque 0 — Docs

| ID | Tarea | Estado |
|----|-------|--------|
| T-000 | Realineación documental Altivox OS + ADR-010 | **done** |
| T-000b | Cinco motores del núcleo + ADR-011 | **done** |
| T-000c | Prebloque B2-A sync docs + ADR-013 | **done** |
| T-000d | Prebloque B4-A sync docs + ADR-014 | **done** |
| T-000e | Prebloque B5-A sync docs + ADR-015 | **done** |
| T-000f | Prebloque B6-A sync docs + ADR-016 | **done** |

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
| T-201 | Migrar leads/clientes desde HTML | gradual; **no** B4–B6 |

---

## P1 — Bloque 4 — JARVIS + motores (interfaces) · **cerrado**

| ID | Tarea | Estado |
|----|-------|--------|
| T-300 | JARVIS Core caller → PE | **done** |
| T-301 | Fronteras TypeScript de motores | **done** |

---

## P1 — Bloque 5 — Agent runtime + service modules · **cerrado**

Contrato: [`ADR-015`](./adr/ADR-015-bloque-5-agent-runtime.md).

| ID | Tarea | Estado |
|----|-------|--------|
| T-306 | Agent Runtime (ciclo de vida de runs) | **done** |
| T-306b | Agent Manager runtime (registro por manifest) | **done** |
| T-307 | Primer service module plugin (`web`) | **done** |
| T-307b | Tool Registry runtime **mínimo** (`llm.complete`) | **done** |
| T-307c | Memory / Capability runtimes **mínimos** | **done** |
| T-307d | JARVIS Core: intenciones → Agent Runtime / Manager | **done** |
| T-308 | Relabel/retirar `agentes.html` cosmético | pendiente (no bloquea cierre B5) |

**Fuera de B5:** Workflow runtime · Review · Deploy · ZIP · CRM · chat como agente · reabrir B0–B4.

---

## P1 — Bloque 6 — Review Engine · **cerrado**

Contrato: [`ADR-016`](./adr/ADR-016-bloque-6-review-engine.md).

| ID | Tarea | Estado |
|----|-------|--------|
| T-400 | Review Engine + sesiones (proyecto/versión/deliverables) | **done** |
| T-400b | `review_tokens` + emisión/revocación Ops (`review.create` / `review.revoke`) | **done** |
| T-400c | Portal `/r/[token]` + acciones cliente | **done** |
| T-400d | APIs review + persistencia propia | **done** |
| T-400e | JARVIS caller create/revoke (sin exponer agentes) | **done** |

**Fuera de B6:** Deploy · ZIP · hosting · vendors · Workflow runtime · CRM · chat · agentes al cliente · marketplace · reabrir PE/Security/Ops · agente revisor.

---

## P1 — Bloque 7 — Entrega + Deployment

| ID | Tarea | Notas |
|----|-------|-------|
| T-401 | ZIP delivery pipeline | **No** B6 · solo tras B6 |
| T-402 | Deploy adapters + confirmación | **No** B6 · solo tras B6 |

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
| Runtime completo de todos los motores en B5 | ADR-015 = recorte |
| Plataforma agentes pública | ADR-010 |
| JARVIS respuesta unificada al visitante | ADR-010 |
| Portal demo como producto cliente IA | `/r/[token]` = B6 (sin agentes) |
| Review Engine dentro de PE o Agent Runtime | ADR-016 = motor/superficie independientes |
| Deploy dentro de B6 | ADR-016 → B7 |

---

## Hecho reciente

| Ítem | Ref |
|------|-----|
| Bloque 4 JARVIS + fronteras | ADR-014 · cerrado |
| Prebloque B5-A | ADR-015 · sync docs |
| Bloque 5 Agent Runtime + módulo web | ADR-015 · cerrado |
| Prebloque B6-A | ADR-016 · sync docs |
| **Bloque 6** Review Engine + `/r/[token]` | **ADR-016 · cerrado** |
