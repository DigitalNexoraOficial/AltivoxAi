# Núcleo oficial — Motores de Altivox OS

**Estado:** Fuente de verdad · actualizado Prebloque B5-A (2026-08-07)  
**ADRs:** [`ADR-011`](./adr/ADR-011-core-engines.md) · [`ADR-013`](./adr/ADR-013-project-engine.md) · [`ADR-014`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md) · [`ADR-015`](./adr/ADR-015-bloque-5-agent-runtime.md)

Estos motores forman el **núcleo estable** a largo plazo.  
JARVIS **orquesta**; no sustituye a los motores.

```
                    ┌─────────────┐
                    │   JARVIS    │  (B4: Core caller · B5: + Agent Runtime)
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
   Workflow Engine   Capability      Project Engine
   (frontera B4 ·    Registry        (B2 — CERRADO)
    runtime ≠ B5)    (B4 frontera ·
                     B5 runtime mínimo)
           │               │
           └───────────────┼───────────────┘
                           ▼
                   Agent Manager (B4 frontera · B5 runtime registro)
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        Tool Registry  Memory Engine  Review / Deploy
        (B5: mínimo    (B5: mínimo    (B6 / B7)
         LLM only)      runs)
```

---

## 1. Project Engine — cerrado (B2)

Implementado · [`ADR-013`](./adr/ADR-013-project-engine.md).  
Dueño de proyectos, estados, versiones, entregables, eventos de dominio.  
B5 **no** reescribe el PE ni añade capabilities al agregado proyecto.

---

## 2. Workflow Engine — frontera B4 · runtime **fuera de B5**

Procesos reutilizables.  
**B5 (ADR-015):** no implementa Workflow runtime.

---

## 3. Tool Registry — frontera B4 · runtime **mínimo en B5**

Única puerta a herramientas externas (ADR-011).  
**B5:** solo proveedores LLM / inferencia aprobados.  
**Fuera de B5:** GitHub, Vercel, WordPress, FTP, publish, etc. (B7 / ampliación posterior).

---

## 4. Memory Engine — frontera B4 · runtime **mínimo en B5**

**B5:** hechos/logs de runs de agentes.  
**Fuera de B5:** KB corporativa / memoria unificada completa.

---

## 5. Capability Registry — frontera B4 · runtime **mínimo en B5**

**B5:** resolver capabilities de manifests de módulos/agentes.  
**Fuera de B5:** persistir `required_capabilities` en `projects`.

---

## 6. JARVIS

**B4 cerrado:** Core caller → PE (`src/core/jarvis`).  
**B5:** puede orquestar Agent Manager / Agent Runtime además del PE.  
**No** superadmin (ADR-012).

---

## 7. Agent Runtime + Service Modules — Bloque 5 · **cerrado**

Contrato: [`ADR-015`](./adr/ADR-015-bloque-5-agent-runtime.md).  
Código: `src/core/agent-runtime`, `src/core/agent-manager`, Tool/Memory/Capability mínimos, `src/modules/web`, APIs `/api/ops/agents*` · `/api/ops/agent-runs*`.

---

## 8. Orden de implementación

1. Seguridad — B1 ✅  
2. Project Engine — B2 ✅  
3. Ops Shell — B3 ✅  
4. JARVIS + fronteras motores — B4 ✅ (ADR-014)  
5. **Agent Runtime + service modules** — B5 ✅ (ADR-015)  
6. **Review Engine + `/r/[token]`** — B6  
7. **Entrega ZIP + Deployment Engine** — B7  

Visión: ADR-011. Recortes: ADR-013 · ADR-014 · ADR-015.
