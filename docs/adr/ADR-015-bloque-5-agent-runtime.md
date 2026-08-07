# ADR-015 — Bloque 5: Agent Runtime + Service Modules (recorte)

- **Estado:** Aceptado e implementado  
- **Fecha:** 2026-08-07 (contrato Prebloque B5-A) · **implementación código:** 2026-08 (Bloque 5 cerrado)  
- **Decisores:** Owner (Xabier) · arquitectura Altivox OS  
- **Analogía:** mismo tipo de corte que [`ADR-013`](./ADR-013-project-engine.md) / [`ADR-014`](./ADR-014-bloque-4-jarvis-motores-interfaces.md)
- **Bloque cerrado:** B5 — Agent Runtime + Agent Manager + módulo `web` + Tool/Memory/Capability mínimos

---

# Contexto

Los bloques **0–4** están cerrados:

| Bloque | Contenido | Contrato |
|--------|-----------|----------|
| 0–1 | Docs + Seguridad | ADR-010 · ADR-011 · ADR-012 |
| 2 | Project Engine (recorte) | ADR-013 |
| 3 | Shell `/ops` | Roadmap Fase 3 |
| 4 | JARVIS Core caller + fronteras TypeScript de motores | ADR-014 |

B4 dejó **interfaces** (Workflow, Tool Registry, Memory, Capability, Agent Manager boundary) y un **JARVIS Core** que solo orquesta llamadas a use-cases del Project Engine. **Sin** Agent Runtime.

El roadmap declara a continuación:

- **5.** Agent runtime + service modules  
- **6.** Review Engine + `/r/[token]`  
- **7.** Entrega ZIP + Deployment Engine  

Sin un ADR de recorte, B5 tiende a absorber Tool Registry completo, Memory Engine completo, Workflow runtime, Capability binding en proyectos, Review y Deploy.

Este ADR es el **Prebloque B5-A**: sincronización documental. **No** implementa el Bloque 5.

---

# Problema

1. «Agent Runtime» se interpreta como plataforma completa de agentes + todos los motores.  
2. ADR-011 exige I/O externo solo vía Tool Registry y memoria vía Memory Engine — sin corte, B5 o viola esos principios o implementa todos los motores de golpe.  
3. Service Modules carecen de un primer alcance congelado.  
4. Docs residuales aún describen B4 como pendiente o JARVIS solo como HTML legacy.  
5. api/database agrupan “bloques 5–7” sin separar persistencia/APIs de agentes vs Review/Deploy.

---

# Decisión — Qué incluye B5

1. **Agent Runtime base** — ejecución interna de agentes del OS: ciclo de vida de un run (iniciar / ejecutar / completar / fallar / detener).  
2. **Agent Manager runtime** — registro y resolución de agentes por manifest (alta/baja/consulta en caliente **dentro del OS**). No es marketplace ni UI pública.  
3. **Service Modules (recorte)** — patrón de módulo/plugin + **un** primer módulo de servicio alineado a un `service_type` ya usado en proyectos; declara capabilities tipadas en el **manifest del módulo**, sin reescribir el núcleo.  
4. **Integración con JARVIS Core** — JARVIS permanece orquestador/caller; puede solicitar altas/ejecuciones al Agent Manager / Agent Runtime. **No** sustituye PE ni ejecuta entregables él mismo.  
5. **Seguridad** — todo agente y toda mutación relevante usan `Subject` + `can()` (techos B1, p. ej. `principalType: "agent"`). Sin bypass.  
6. **Tool Registry — runtime mínimo** — **solo** lo imprescindible para que un agente invoque proveedores LLM / inferencia **aprobados en configuración interna**, siempre a través del Tool Registry (ADR-011). **No** adapters de GitHub, Vercel, WordPress, FTP, deploy ni automatizaciones de entrega.  
7. **Memory Engine — runtime mínimo** — hechos/logs de **runs de agentes** (y metadatos de ejecución), no knowledge base corporativa ni memoria unificada de todo el OS.  
8. **Capability Registry — runtime mínimo** — resolver capabilities **declaradas en manifests de módulos/agentes** hacia agentes registrados. **No** añadir `required_capabilities` al agregado Project del PE (ADR-013 intacto).  
9. **Workflow Engine** — **fuera de B5** (sigue frontera B4; runtime diferido).  
10. Este ADR **no diseña** clases, rutas HTTP, schemas SQL ni firmas TypeScript. Congela alcance. Persistencia/APIs de agentes, si la implementación las necesita, se definirán en el bloque de código bajo este corte — **sin** anticipar Review/Deploy.

---

# Decisión — Qué excluye B5

Bloque 5 **excluye explícitamente**:

- Review Engine  
- `review_tokens` / comentarios de review  
- Portal `/r/[token]`  
- Deployment Engine  
- ZIP / export de entrega a cliente  
- Integraciones externas **no** aprobadas en el recorte Tool (GitHub, Vercel, WordPress, FTP, publish, etc.)  
- Workflow Engine **runtime** (procesos reutilizables ejecutables)  
- Capability binding persistido en `projects` / reescritura del PE  
- Memory Engine “completo” (KB corporativa, memoria cross-proyecto unificada)  
- Tool Registry completo (catálogo amplio de vendors)  
- CRM / migración HTML → App Router  
- Chat público como agente o como JARVIS  
- Reabrir Bloques 0–4 (PE / Security / Ops / JARVIS-as-interfaces) salvo bug real  
- Stubs que simulen agentes, review o deploy  
- Plataforma pública de agentes (ADR-010)

---

# Fronteras arquitectónicas

| Pieza | Rol en B5 |
|-------|-----------|
| **JARVIS Core** | Orquestador / caller; coordina; no es chatbot; no es PE; no es Tool Registry |
| **Agent Runtime** | Ejecución de agentes internos |
| **Agent Manager** | Registro/resolución de agentes (runtime de registro, no solo boundary) |
| **Project Engine** | Dueño del dominio proyecto (ADR-013); B5 no lo sustituye |
| **Security** | Dueño de autorización (`can()`); B5 no crea bypass |
| **Fronteras B4** | Contratos que en B5 reciben **implementación mínima** solo donde este ADR lo autoriza |
| **Service Module** | Plugin de oferta; no parchea el core |

Cadena obligatoria:

`caller (humano OPS o JARVIS) → Subject → can() → use-case / Agent Runtime → dominio permitido`

---

# Seguridad

1. Todo agente opera con `Subject` (típicamente `principalType: "agent"`) bajo techos B1.  
2. Toda acción sensible pasa por `can(subject, action, resource)`.  
3. JARVIS **no** es superadmin (ADR-012).  
4. No hay bypass interno, service_role en el orquestador, ni roles nuevos “dios”.  
5. Prompts, IDs de agentes y tools **no** se exponen en web pública ni en review (review aún no existe en B5).

---

# Consecuencias

### Qué habilita B5

- Ejecutar agentes privados dentro del OS.  
- Registrar agentes vía Agent Manager.  
- Extender la agencia con **un** primer service module sin tocar el core.  
- Que JARVIS orqueste runs de agentes además de PE.  
- I/O LLM mínimo vía Tool Registry (solo lo autorizado).

### Qué queda para B6 / B7

- **B6:** Review Engine, tokens, `/r/[token]`.  
- **B7:** ZIP, Deployment Engine, adapters de publish (vía Tool Registry ampliado).

### Qué no implica ADR-015

- No implica Workflow runtime.  
- No implica Tool Registry de vendors de entrega.  
- No implica Memory Engine corporativo completo.  
- No implica capabilities en la tabla `projects`.  
- No implica UI completa de “consola de agentes” ni chat JARVIS público.  
- **Implementación B5 cerrada** tras OK de código; este ADR permanece como contrato de recorte.

---

# Referencias

- [`ADR-010`](./ADR-010-altivox-os-pivot.md)  
- [`ADR-011`](./ADR-011-core-engines.md)  
- [`ADR-012`](./ADR-012-security-foundation.md)  
- [`ADR-013`](./ADR-013-project-engine.md)  
- [`ADR-014`](./ADR-014-bloque-4-jarvis-motores-interfaces.md)  
- [`../roadmap.md`](../roadmap.md)  
- [`../agents.md`](../agents.md)  
- [`../core-engines.md`](../core-engines.md)  
- [`../todo.md`](../todo.md)  
- [`../MEMORY.md`](../MEMORY.md)
