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
Asignación de agentes
  │
  ▼
Ejecución
  │
  ▼
Control de calidad
  │
  ▼
Versión candidata
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
Entrega
  │
  ▼
Despliegue opcional  (siempre con confirmación humana)
  │
  ▼
Mantenimiento
```

### Semántica de estados (dominio)

| Estado | Quién actúa | Superficie |
|--------|-------------|------------|
| Lead | Visitante + sistema captación | Pública → OS |
| Cliente | Equipo / conversión CRM | OS |
| Proyecto | JARVIS crea / equipo confirma | OS |
| Planificación | JARVIS + módulo de servicio | OS |
| Asignación de agentes | JARVIS | OS |
| Ejecución | Agentes privados | OS (invisible al cliente) |
| Control de calidad | Agente QA / política / humano | OS |
| Versión candidata | Sistema empaqueta entregable | OS |
| URL de revisión | Cliente | `/r/[token]` |
| Cambios solicitados | Cliente pide; OS reabre trabajo | Review → OS |
| Aprobación | Cliente | Review |
| Entrega | OS genera ZIP / artefactos | OS (+ descarga cliente según política) |
| Despliegue opcional | OS adapters + confirmación | OS |
| Mantenimiento | OS + módulos | OS |

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
2. Conversión a Cliente (datos contractuales mínimos).  
3. JARVIS (o humano) crea **Proyecto** con `serviceType` del módulo.  
4. Planificación: tareas, estimaciones, agentes sugeridos por el módulo.  
5. Asignación: Agent Manager reserva workers.  
6. Ejecución: runs con logs, coste, artefactos parciales.  
7. QA: checklist del módulo; fallos → re-ejecución o escalado humano.  
8. Versión candidata: snapshot versionado + manifest de entregables.  
9. Emisión de `review_token` → URL `/r/[token]`.  
10. Feedback del cliente como eventos (`review.change_requested`, `review.approved`, …).  
11. Entrega: ZIP (código, docs, guía, env example, README).  
12. Deploy opcional vía adapter (GitHub, Vercel, WordPress, FTP, …) **con confirmación**.  
13. Mantenimiento: proyecto en estado `maintenance` con historial continuo.

Todo queda en memoria/audit log.

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
