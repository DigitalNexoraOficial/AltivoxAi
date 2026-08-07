# ADR-014 — Bloque 4: JARVIS + resto de motores (interfaces)

- **Estado:** Aceptado e implementado  
- **Fecha:** 2026-08-07 (contrato Prebloque B4-A) · **implementación código:** 2026-08 (Bloque 4 cerrado)  
- **Decisores:** Owner (Xabier) · arquitectura Altivox OS  
- **Analogía:** mismo tipo de corte que [`ADR-013`](./ADR-013-project-engine.md) hizo para el Project Engine antes de su implementación
- **Bloque cerrado:** B4 — JARVIS Core caller + fronteras TypeScript de motores

---

# Contexto

Los bloques **0–3** están cerrados:

| Bloque | Contenido | Contrato |
|--------|-----------|----------|
| 0 | Docs / pivot Altivox OS | ADR-010 · ADR-011 |
| 1 | Seguridad | ADR-012 |
| 2 | Project Engine (recorte) | ADR-013 |
| 3 | Shell `/ops` + UI Proyectos | Roadmap Fase 3 |

El roadmap declara a continuación:

- **4.** JARVIS + resto de motores (**interfaces**)  
- **5.** Agent runtime + service modules  
- **6.** Review Engine + `/r/[token]`  
- **7.** Entrega ZIP + Deployment Engine (vía Tool Registry)

La auditoría previa a este Prebloque concluyó que **Bloque 4 no estaba listo para implementarse**: faltaba un contrato de corte, y había contradicciones entre roadmap, todo, agents, core-engines, flow, architecture y MEMORY sobre qué cabe en 4 frente a 5–7.

Este ADR es el **Prebloque B4-A**: sincronización documental. **No** implementa el Bloque 4.

---

# Problema

Sin un ADR de recorte:

1. «JARVIS» se interpreta como producto completo (workflows, agentes, review, deploy).  
2. «Resto de motores (interfaces)» se confunde con **runtimes** de Workflow, Tool Registry, Memory, Capability Registry y Agent Manager.  
3. El backlog mezcla tareas de Bloques 4 y 5 en un solo saco.  
4. Documentos de visión siguen hablando de fases ya cerradas como «pendientes de código».  
5. Existe riesgo de scope creep hacia Review Engine, Deployment Engine, módulos de servicio, stubs o APIs/tablas nuevas.

Hace falta el mismo tipo de congelación que ADR-013 aplicó al Project Engine: **alcance explícito, límites explícitos, cero ambigüedad**.

---

# Decisión

1. **Bloque 4** queda definido únicamente como el corte de **interfaces / fronteras de orquestación**:  
   - JARVIS como **Director de Proyectos / orquestador** (caller de motores; no chatbot; no Project Engine; no ejecutor de entregables).  
   - El **resto de motores del núcleo** (Workflow Engine, Tool Registry, Memory Engine, Capability Registry), más Agent Manager como pieza de registro del OS, quedan **nombrados y delimitados como fronteras** respecto a JARVIS y al Project Engine ya cerrado.  
2. «Interfaces» en el roadmap significa **contratos de frontera y responsabilidad** entre JARVIS y esos motores — **no** runtimes, **no** pipelines, **no** ejecución de agentes, **no** I/O a vendors.  
3. **Bloque 5** es el primer bloque que introduce **Agent runtime** y **service modules**.  
4. **Bloque 6** es **Review Engine** + portal `/r/[token]`.  
5. **Bloque 7** es **entrega ZIP** + **Deployment Engine** (vía Tool Registry).  
6. Bloque 4 **no reabre** Bloques 0–3 ni modifica ADR-010, ADR-011, ADR-012 ni ADR-013.  
7. Hasta existir el runtime de JARVIS (fuera del alcance de este contrato de corte documental; y en todo caso **sin** anticipar runtimes de motores en B4), las transiciones de proyecto siguen siendo **manuales vía OPS** sobre el Project Engine (ADR-013).  
8. Este ADR **no diseña** implementación, clases, APIs, tablas ni firmas TypeScript. Congela alcance.

---

# Alcance

Dentro del **contrato documental del Bloque 4** (y de lo que una futura implementación de B4 podrá tocar, una vez aprobada explícitamente):

1. **JARVIS — frontera de orquestación**  
   - Qué es: director / orquestador del OS.  
   - Qué no es: chatbot, almacén de proyectos, Tool Registry, ejecutor de entregables, superadmin.  
   - Relación: **llama** al Project Engine (ya existente) y, cuando existan, a los demás motores; **no** sustituye a ninguno.

2. **Resto de motores del núcleo — solo como fronteras**  
   - Workflow Engine  
   - Tool Registry  
   - Memory Engine  
   - Capability Registry  
   - Agent Manager (pieza de núcleo para registro; **sin** runtime de agentes en B4)

   En B4 se aclara **quién es dueño de qué** y **qué queda diferido a runtime**. No se ejecutan procesos, tools, memoria runtime, capabilities en proyectos ni agentes.

3. **Separación explícita de bloques posteriores**  
   - B5 / B6 / B7 quedan nombrados y fuera del alcance de B4 (ver No objetivos y Referencias al roadmap).

4. **Documentación alineada**  
   - roadmap, architecture, flow, core-engines, agents, MEMORY, todo, product-vision, api, database — sincronizados con este ADR (Prebloque B4-A).

---

# No objetivos (Out of Scope)

Bloque 4 **excluye explícitamente**:

- Agent Runtime  
- Agent Manager **runtime** (ejecución / scheduling de agentes)  
- Workflow **runtime**  
- Tool Registry **runtime**  
- Capability Registry **runtime**  
- Memory **runtime**  
- Review Engine  
- Deployment Engine  
- service modules  
- nuevas tablas  
- nuevas APIs  
- stubs  
- simulaciones de motores  
- chatbot público (sin cambios de producto; sigue siendo captación, ADR-010 / enmienda ADR-005)  
- cambios en Bloque 0  
- cambios en Bloque 1  
- cambios en Bloque 2  
- cambios en Bloque 3  

También fuera de B4 (por pertenecer a fases posteriores del roadmap):

- Portal `/r/[token]` y tokens de revisión (Bloque 6)  
- Entrega ZIP y publish a vendors (Bloque 7)  
- Migración CRM HTML → App Router (backlog UI, no B4)

---

# Restricciones arquitectónicas

1. Vigencia plena de **ADR-010**, **ADR-011**, **ADR-012**, **ADR-013**. Este ADR no los enmienda.  
2. Tres superficies inalteradas: web pública · `/ops` · `/r/[token]` (este último sigue diferido a B6).  
3. Autorización en servidor: mutaciones ops vía `can()`; sin elevar privilegios de JARVIS a superadmin (ADR-012).  
4. Project Engine permanece el dueño del dominio de proyectos; JARVIS no crea proyectos «por fuera» del PE.  
5. Sin I/O a vendors fuera del Tool Registry **cuando exista**; en B4 el Tool Registry **no** tiene runtime.  
6. Sin exponer agentes, prompts ni herramientas internas en web pública ni en review.  
7. No anticipar tablas/APIs de motores futuros (principio de roadmap).  
8. No fingir motores con stubs ni UIs cosméticas presentadas como runtime.  
9. No redefinir los cinco motores de ADR-011; solo fijar **cuándo** entra cada frontera vs cada runtime.

---

# Consecuencias

- El Bloque 4 queda **documentalmente cortado**: se puede auditar alcance sin ambigüedad.  
- Roadmap y backlog dejan de mezclar interfaces (B4) con Agent runtime / módulos (B5) y con Review/Deploy (B6–B7).  
- **Implementación B4 cerrada** (JARVIS Core + fronteras). Este ADR permanece como contrato.  
- JARVIS legacy (`public/legacy/jarvis.html`) y `agentes.html` cosmético siguen sin ser el runtime OS.  
- OPS humano + Project Engine (B2) + shell (B3) fueron el camino operativo hasta los runtimes B5–B7.

---

# Referencias

- [`ADR-010`](./ADR-010-altivox-os-pivot.md) — pivot Altivox OS  
- [`ADR-011`](./ADR-011-core-engines.md) — cinco motores del núcleo  
- [`ADR-012`](./ADR-012-security-foundation.md) — seguridad  
- [`ADR-013`](./ADR-013-project-engine.md) — Project Engine B2 (recorte)  
- [`../roadmap.md`](../roadmap.md) — orden de bloques 4–7  
- [`../core-engines.md`](../core-engines.md)  
- [`../flow.md`](../flow.md)  
- [`../agents.md`](../agents.md)  
- [`../architecture.md`](../architecture.md)  
- [`../MEMORY.md`](../MEMORY.md)  
- [`../todo.md`](../todo.md)
