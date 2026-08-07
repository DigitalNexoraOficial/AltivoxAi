# Flujo oficial — Altivox OS

**Este documento es la referencia obligatoria** del ciclo de vida de un proyecto.  
Todo desarrollo futuro (APIs, UI `/ops`, agentes, review, deploy) debe mapearse a estos estados.

Visión: [`product-vision.md`](./product-vision.md)

---

## 1. Tres superficies en el flujo

```
[Web pública]  captación
      │
      ▼
[Altivox OS /ops]  inteligencia + entrega interna
      │
      ▼
[/r/[token]]  revisión cliente
      │
      ▼
[Altivox OS /ops]  entrega / deploy / mantenimiento
```

---

## 2. Ciclo de vida oficial del proyecto

```
Lead
  │
  ▼
Cliente
  │
  ▼
Proyecto
  │
  ▼
Planificación
  │
  ▼
Definición de capabilities
  │
  ▼
Asignación de agentes  (Capability Registry → JARVIS)
  │
  ▼
Ejecución
  │
  ▼
Control de calidad
  │
  ▼
Versión candidata  (Project Engine)
  │
  ▼
URL privada de revisión  (/r/[token])
  │
  ├───────────────┐
  ▼               │
Cambios solicitados ───► (vuelve a Ejecución o QA según política)
  │
  ▼
Aprobación
  │
  ▼
Entrega  (Project Engine)
  │
  ▼
Despliegue opcional  (Project Engine → Tool Registry; confirmación humana)
  │
  ▼
Mantenimiento
```

Toda mutación de proyecto pasa por el **Project Engine**. Los procesos reutilizables viven en el **Workflow Engine**. Memoria crítica en el **Memory Engine**. I/O externo solo **Tool Registry**.

### Semántica de estados (dominio)

| Estado | Quién actúa | Superficie |
|--------|-------------|------------|
| Lead | Visitante + sistema captación | Pública → OS |
| Cliente | Equipo / conversión CRM | OS |
| Proyecto | JARVIS crea / equipo confirma | OS |
| Planificación | JARVIS + módulo + Workflow Engine | OS |
| Capabilities | Proyecto declara necesidades | OS |
| Asignación de agentes | JARVIS + Capability Registry | OS |
| Ejecución | Agentes privados (Tool Registry / Memory Engine) | OS (invisible al cliente) |
| Control de calidad | Agente QA / política / humano | OS |
| Versión candidata | **Project Engine** empaqueta | OS |
| URL de revisión | Cliente | `/r/[token]` |
| Cambios solicitados | Cliente pide; Project Engine reabre | Review → OS |
| Aprobación | Cliente | Review |
| Entrega | Project Engine genera ZIP / artefactos | OS |
| Despliegue opcional | Project Engine → Tool Registry (+ confirmación) | OS |
| Mantenimiento | Project Engine + módulos | OS |

---

## 3. Captación (web pública) — as-is / to-be

### As-is (código actual)

```
Landing → form/chat/WA/booking → POST /api/lead → leads → admin HTML / n8n
```

### To-be (OS)

```
Landing → form/chat comercial → Lead
  → (OS) calificación / conversión → Cliente
  → JARVIS puede proponer Proyecto según tipo de servicio (módulo)
```

El chat público **no** invoca el Agent Manager.

---

## 4. Dentro de Altivox OS

1. Lead visible en CRM.  
2. Conversión a Cliente.  
3. JARVIS (o humano) **solicita** al Project Engine crear **Proyecto** (`serviceType` del módulo).  
4. Opcional: JARVIS **ejecuta** un workflow del Workflow Engine.  
5. Planificación: capabilities + estimaciones (no agent IDs fijos).  
6. JARVIS resuelve capabilities → agentes (Capability Registry) → Agent Manager.  
7. Ejecución: runs; tools solo Tool Registry; hechos en Memory Engine.  
8. QA → Project Engine marca versión candidata.  
9. Project Engine emite `review_token` → `/r/[token]`.  
10. Feedback cliente como eventos; Project Engine reaplica estados.  
11. Entrega ZIP vía Project Engine.  
12. Deploy opcional: Project Engine → Tool Registry (+ confirmación).  
13. Mantenimiento: estado en Project Engine + historial en Memory Engine.

---

## 5. Portal `/r/[token]` — reglas

Permitido:

- Ver entregable / preview acordado  
- Comentarios  
- Solicitar cambios  
- Aprobar / rechazar  

Prohibido:

- Lista de agentes, prompts, tools, costes internos, logs de OS, otros clientes, configuración

El token es de **alcance mínimo** (un proyecto / una versión).

---

## 6. Eventos de dominio (objetivo)

Ejemplos (bus interno):

- `lead.created` · `lead.qualified`  
- `client.created`  
- `project.created` · `project.planning_started` · `project.agents_assigned`  
- `agent.run.started` · `agent.run.completed` · `agent.run.failed`  
- `qa.passed` · `qa.failed`  
- `release.candidate_created` · `review.opened`  
- `review.comment_added` · `review.change_requested` · `review.approved` · `review.rejected`  
- `delivery.ready` · `deploy.requested` · `deploy.confirmed` · `deploy.completed`  
- `project.maintenance_entered`

Contratos HTTP: [`api.md`](./api.md).

---

## 7. Mapa de pantallas OS (objetivo)

| Área `/ops` | Relación con el ciclo |
|-------------|----------------------|
| Leads / CRM | Lead → Cliente |
| Clientes | Cliente |
| Proyectos | Proyecto … Mantenimiento |
| JARVIS | Planificación → Asignación → supervisión |
| Agentes / Herramientas | Ejecución |
| Workflows / Automatizaciones | Transiciones y side-effects |
| Conversaciones / Memoria / Logs | Todo el ciclo |
| Despliegues | Despliegue opcional |
| Analíticas | Métricas por fase |
| Configuración / Facturación | Empresa |

---

## 8. Compatibilidad con el código actual

Hasta implementar OS:

- El embudo real termina en **leads + clientes + admin HTML**.  
- No existen estados de Proyecto ni `/r/[token]`.  
- No se debe fingir en UI pública que los “agentes” del chat son el runtime OS.
