# Núcleo oficial — Motores de Altivox OS

**Estado:** Fuente de verdad · actualizado Prebloque B4-A (2026-08-07)  
**ADRs:** [`ADR-011`](./adr/ADR-011-core-engines.md) · [`ADR-013`](./adr/ADR-013-project-engine.md) · [`ADR-014`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md)

Estos motores forman el **núcleo estable** a largo plazo.  
Se comunican por **interfaces** (fronteras de responsabilidad). JARVIS **orquesta**; no sustituye a los motores.

La implementación es **por fases**. Lo que aún no está en código no debe inventarse ni fingirse.

```
                    ┌─────────────┐
                    │   JARVIS    │  (B4: frontera orquestación · runtime ops ≠ B4)
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
   Workflow Engine   Capability      Project Engine
   (B4 frontera ·    Registry        (Bloque 2 — CERRADO)
    runtime ≠ B4)    (B4 frontera ·   projects · versions ·
                     runtime ≠ B4)   deliverables · events
           │               │               │
           └───────────────┼───────────────┘
                           ▼
                   Agent Manager (B4: frontera registro · runtime agentes = B5)
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        Tool Registry  Memory Engine  Review / Deploy
        (B4 frontera)  (B4 frontera)  (B6 / B7 — fuera de B4)
```

---

## 1. Project Engine

**Dueño** del ciclo de vida del proyecto a nivel de datos y transiciones.  
**Estado:** implementado · Bloque 2 cerrado · [`ADR-013`](./adr/ADR-013-project-engine.md).

### 1.1 Alcance Bloque 2 (cerrado — dominio)

Entidades / tablas:

| Entidad | Tabla |
|---------|-------|
| Project | `projects` |
| ProjectVersion | `project_versions` |
| Deliverable | `deliverables` |
| ProjectEvent | `project_events` (solo dominio) |

Estados de `projects.status` (fase actual):

`draft` · `planning` · `in_progress` · `qa` · `review` · `approved` · `delivered` · `maintenance` · `cancelled` · `archived`

- El estado **`review`** es solo una **fase del proyecto**.  
- **No** implica tokens, portal `/r/[token]` ni comentarios de cliente.  
- Versionado = **ProjectVersion**.  
- El proyecto conoce `service_type`, **no** `required_capabilities`.  
- Transiciones complejas del ciclo largo se hacen **manualmente vía OPS** (`can` + API) hasta runtimes posteriores. Ver [`flow.md`](./flow.md).

### 1.2 Diferido (NO pertenece al Bloque 2 ni al Bloque 4)

| Capacidad | Motor / bloque futuro |
|-----------|------------------------|
| `review_tokens`, comentarios, portal `/r/[token]` | Review Engine / **Bloque 6** |
| `deployments`, publish a vendors | Deployment Engine + Tool Registry / **Bloque 7** |
| Capabilities / agent binding en runtime | Capability Registry runtime + JARVIS / **B5+** |
| Workflows reutilizables en ejecución | Workflow Engine runtime / **posterior a B4** |
| I/O externo (GitHub, Vercel, LLMs…) | Tool Registry runtime / **posterior a B4** |
| Memoria runtime unificada | Memory Engine runtime / **posterior a B4** |
| Ejecución de agentes | Agent Runtime / **Bloque 5** |
| Orquestación automática operativa | JARVIS operativo tras fronteras B4 |

### 1.3 Reglas permanentes

- **JARVIS no crea proyectos directamente** — invoca la interfaz del Project Engine.  
- Nadie muta `status` fuera de la máquina de estados del engine.  
- `project_events` = hechos de dominio; `audit_events` = técnico (Bloque 1).  
- Sin I/O a vendors desde el PE.

### 1.4 No hace

- Elegir agentes · llamar Tool Registry · emitir review tokens · ejecutar deploys.

---

## 2. Workflow Engine — frontera B4 · runtime diferido

Procesos reutilizables. Independiente de JARVIS; JARVIS solo los ejecutará cuando exista runtime.  
**Bloque 4:** se nombra y delimita la frontera. **No** se implementa el runtime en B4 ([`ADR-014`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md)).

---

## 3. Tool Registry — frontera B4 · runtime diferido

Única puerta a herramientas externas.  
Ningún agente/JARVIS habla con GitHub/Vercel/LLM/etc. sin él.  
**Bloque 4:** frontera. **No** runtime en B4.

---

## 4. Memory Engine — frontera B4 · runtime diferido

Memoria runtime central. Distinta de `docs/MEMORY.md` (humano/repo).  
**Bloque 4:** frontera. **No** runtime en B4. Los hechos de proyecto viven en tablas PE + `project_events` hasta entonces.

---

## 5. Capability Registry — frontera B4 · runtime diferido

Desacopla necesidades (capabilities) de agentes.  
Los proyectos **no** almacenan capabilities en B2 — solo `service_type`.  
**Bloque 4:** frontera. **No** runtime ni binding en proyectos en B4.

---

## 6. JARVIS — frontera de orquestación (Bloque 4)

Director de proyectos / orquestador. Caller del PE y demás motores.  
**No** superadmin (ADR-012).  
**Bloque 4 ([ADR-014](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md)):** fija qué es / qué no es y cómo se relaciona con los motores **como fronteras**.  
Hasta que exista orquestación operativa con runtimes, un humano OPS invoca los use-cases del PE.

---

## 7. Orden de implementación

1. Seguridad — Bloque 1 ✅  
2. Project Engine (recorte B2) ✅ — ADR-013  
3. Ops Shell — Bloque 3 ✅  
4. **JARVIS + resto de motores (interfaces)** — Bloque 4 · ADR-014 (contrato docs; código tras OK)  
5. **Agent runtime + service modules** — Bloque 5  
6. **Review Engine + `/r/[token]`** — Bloque 6  
7. **Entrega ZIP + Deployment Engine** — Bloque 7  

Visión a largo plazo: ADR-011. Recorte PE: ADR-013. Corte B4: ADR-014.
