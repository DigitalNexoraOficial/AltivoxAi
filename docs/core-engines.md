# Núcleo oficial — Motores de Altivox OS

**Estado:** Fuente de verdad · actualizado Prebloque B2-A (2026-08-07)  
**ADRs:** [`ADR-011`](./adr/ADR-011-core-engines.md) · [`ADR-013`](./adr/ADR-013-project-engine.md)

Estos motores forman el **núcleo estable** a largo plazo.  
Se comunican por **interfaces**. JARVIS **orquesta**; no sustituye a los motores.

La implementación es **por fases**. Lo que aún no está en código no debe inventarse en el Project Engine.

```
                    ┌─────────────┐
                    │   JARVIS    │  (futuro — orquestador)
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
   Workflow Engine   Capability      Project Engine
   (diferido)        Registry        (Bloque 2 — recorte)
                     (diferido)      projects · versions ·
                                     deliverables · events
           │               │               │
           └───────────────┼───────────────┘
                           ▼
                   Agent Manager (diferido)
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        Tool Registry  Memory Engine  Review / Deploy
        (diferido)     (diferido)     engines (diferidos)
```

---

## 1. Project Engine

**Dueño** del ciclo de vida del proyecto a nivel de datos y transiciones.

### 1.1 Alcance Bloque 2 (IMPLEMENTAR — dominio)

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
- **No** implica tokens, portal `/r/[token]` ni comentarios de cliente en este bloque.  
- Versionado = **ProjectVersion** (no estados extra de “release_candidate”).  
- El proyecto conoce `service_type`, **no** `required_capabilities`.  
- Transiciones complejas del ciclo largo se hacen **manualmente vía OPS** (`can` + API) hasta que existan Workflow/JARVIS/agentes. Ver [`flow.md`](./flow.md).

### 1.2 Diferido (NO pertenece al Bloque 2)

| Capacidad | Motor / bloque futuro |
|-----------|------------------------|
| `review_tokens`, comentarios, portal `/r/[token]` | Review Engine / bloque Review |
| `deployments`, publish a vendors | Deployment Engine + Tool Registry |
| Capabilities / agent binding | Capability Registry + JARVIS |
| Workflows reutilizables | Workflow Engine |
| I/O externo (GitHub, Vercel, LLMs…) | Tool Registry |
| Memoria runtime unificada | Memory Engine |
| Ejecución de agentes | Agent Runtime |
| Orquestación automática | JARVIS Runtime |

### 1.3 Reglas permanentes

- **JARVIS no crea proyectos directamente** — invoca la interfaz del Project Engine (cuando exista).  
- Nadie muta `status` fuera de la máquina de estados del engine.  
- `project_events` = hechos de dominio; `audit_events` = técnico (Bloque 1).  
- Sin I/O a vendors desde el PE.

### 1.4 No hace

- Elegir agentes · llamar Tool Registry · emitir review tokens · ejecutar deploys.

---

## 2. Workflow Engine — diferido

Procesos reutilizables. Independiente de JARVIS; JARVIS solo los ejecutará.  
No se implementa en Bloque 2.

---

## 3. Tool Registry — diferido

Única puerta a herramientas externas.  
Ningún agente/JARVIS habla con GitHub/Vercel/LLM/etc. sin él.  
No se implementa en Bloque 2.

---

## 4. Memory Engine — diferido

Memoria runtime central. Distinta de `docs/MEMORY.md` (humano/repo).  
No se implementa en Bloque 2. Los hechos de proyecto viven en tablas PE + `project_events` hasta entonces.

---

## 5. Capability Registry — diferido

Desacopla necesidades (capabilities) de agentes.  
Los proyectos **no** almacenan capabilities en Bloque 2 — solo `service_type`.

---

## 6. JARVIS — diferido (runtime)

Director de proyectos / orquestador. Caller del PE y demás motores.  
**No** superadmin (ADR-012).  
Hasta que exista, un humano OPS invoca los use-cases del PE.

---

## 7. Orden de implementación

1. Seguridad — Bloque 1 ✅ (código; ops SQL/Upstash pendientes de entorno)  
2. **Project Engine (recorte B2)** — tras sync docs (este Prebloque)  
3. Review Engine · Capability · Workflow · Tool · Memory · Agents · JARVIS · Deploy — bloques posteriores  

Visión a largo plazo: ADR-011. Recorte PE: ADR-013.
