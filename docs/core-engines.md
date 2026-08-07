# Núcleo oficial — Motores de Altivox OS

**Estado:** Fuente de verdad · actualizado Prebloque B7-A (2026-08-07)  
**ADRs:** [`ADR-011`](./adr/ADR-011-core-engines.md) · [`ADR-013`](./adr/ADR-013-project-engine.md) · [`ADR-014`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md) · [`ADR-015`](./adr/ADR-015-bloque-5-agent-runtime.md) · [`ADR-016`](./adr/ADR-016-bloque-6-review-engine.md) · [`ADR-017`](./adr/ADR-017-bloque-7-deploy-engine.md)

Estos motores forman el **núcleo estable** a largo plazo.  
JARVIS **orquesta**; no sustituye a los motores.

```
                    ┌─────────────┐
                    │   JARVIS    │  (B4 caller · B5 agentes · B6 review · B7 deploy)
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
   Workflow Engine   Capability      Project Engine
   (frontera B4 ·    Registry        (B2 — CERRADO)
    runtime diferido) (B4/B5 mínimo)
           │               │
           └───────────────┼───────────────┘
                           ▼
                   Agent Manager / Runtime (B5 — CERRADO · interno)
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        Tool Registry  Memory Engine  Review Engine (B6 ✅)
        (B5: LLM min)  (B5: runs)     Deploy Engine (B7 · ADR-017 · no código)
```

---

## 1. Project Engine — cerrado (B2)

Implementado · [`ADR-013`](./adr/ADR-013-project-engine.md).  
Dueño de proyectos, estados, versiones, entregables, eventos de dominio.  
B5–B7 **no** reescriben el PE.

---

## 2. Workflow Engine — frontera B4 · runtime diferido

Procesos reutilizables. **Fuera de B5–B7.**

---

## 3. Tool Registry — frontera B4 · runtime mínimo B5

Única puerta a herramientas externas (ADR-011).  
**B5:** solo LLM.  
**B7 inicial (ADR-017):** ZIP/Deploy **sin** providers externos; adapters Vercel/FTP/… = **posterior**.

---

## 4. Memory Engine — frontera B4 · runtime mínimo B5

Hechos/logs de runs. KB corporativa = posterior.

---

## 5. Capability Registry — frontera B4 · runtime mínimo B5

Resolver capabilities de manifests. Sin `required_capabilities` en `projects`.

---

## 6. JARVIS

Orquestador/caller (PE · Agent Runtime · Review · futuro Deploy).  
**No** superadmin · **no** chatbot · **no** ejecuta deploy por sí mismo.

---

## 7. Agent Runtime + Service Modules — B5 · **cerrado**

Interno. **No** es Deploy Engine. Agentes **no** despliegan directamente (ADR-017).

---

## 8. Review Engine — B6 · **cerrado**

[`ADR-016`](./adr/ADR-016-bloque-6-review-engine.md).  
Validación cliente (`/r/[token]`). **Approved ≠ deploy automático.**

---

## 9. Deploy Engine — B7 · contrato ADR-017 · **no implementado**

[`ADR-017`](./adr/ADR-017-bloque-7-deploy-engine.md).  
ZIP + deployments + historial. Sin providers en el recorte inicial.  
Prebloque **B7-A** documental; código hasta «OK implementar Bloque 7».

---

## 10. Orden de implementación

1. Seguridad — B1 ✅  
2. Project Engine — B2 ✅  
3. Ops Shell — B3 ✅  
4. JARVIS + fronteras — B4 ✅  
5. Agent Runtime + módulos — B5 ✅  
6. Review Engine + `/r/[token]` — B6 ✅  
7. **Entrega ZIP + Deploy Engine** — B7 (ADR-017 · pendiente de código)  

Visión: ADR-011. Recortes: ADR-013…017.
