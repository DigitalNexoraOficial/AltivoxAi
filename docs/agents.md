# Agentes y JARVIS — Altivox OS (privados)

**Ámbito:** solo superficie **Altivox OS (`/ops`)**.  
Los clientes **no** ven ni invocan agentes.  
Chat público ≠ Agent runtime.

Visión: [`product-vision.md`](./product-vision.md) · Flujo: [`flow.md`](./flow.md)  
**Contrato Bloque 4:** [`ADR-014`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md)

---

## 0. Alcance por bloque (obligatorio)

| Bloque | Qué cubre respecto a JARVIS / agentes |
|--------|----------------------------------------|
| **4** | Fronteras: JARVIS como orquestador; motores + Agent Manager como **límites de responsabilidad**. Sin runtime. |
| **5** | **Agent Runtime** + service modules; Agent Manager en ejecución. |
| **6** | Review Engine / portal — sin exponer agentes. |
| **7** | Deploy / ZIP vía Tool Registry — sin agentes en el portal. |

Este documento describe la **visión de producto** a largo plazo.  
**No** implica que todo esté en Bloque 4. Ver ADR-014 para el corte.

---

## 1. JARVIS — Director de Proyectos

| Campo | Definición |
|-------|------------|
| **Qué es** | Orquestador / director de proyectos del OS |
| **Qué no es** | Chatbot · Project Engine · Tool Registry · ejecutor de entregables |
| **Objetivo (visión)** | Interpretar solicitudes, ejecutar workflows, pedir altas al Project Engine, resolver capabilities→agentes, coordinar el ciclo, detectar errores, informes |
| **Entradas (visión)** | Leads/clientes, eventos, Memory Engine, docs, módulos, Workflow definitions |
| **Salidas (visión)** | Órdenes a Project Engine / Workflow Engine / Agent Manager / Capability Registry; eventos `jarvis.*` |
| **Regla de oro** | No entrega código/artefactos él mismo · **no crea proyectos directamente** · no llama vendors sin Tool Registry |

### Bloque 4 (ADR-014) — solo frontera

En B4 se congela la definición anterior como **contrato de orquestación**.  
**No** se implementan: Workflow runtime, Tool Registry runtime, Memory runtime, Capability runtime, Agent Runtime, Review, Deploy, service modules, stubs.

Capacidades de producto **vía motores en runtime** (bloques posteriores — ver [`core-engines.md`](./core-engines.md)):

- Solicitar creación/plan al **Project Engine** (PE ya existe; caller JARVIS = frontera B4)  
- Ejecutar **Workflow Engine** → runtime ≠ B4  
- Consultar **Capability Registry** y asignar agentes → runtime ≠ B4  
- Activar/detener agentes · consultar **Memory Engine** → **B5+**  
- Pedir review / entrega / deploy → **B6 / B7**  
- Registrar lo ocurrido → Memory runtime ≠ B4  

Implementación actual: `public/jarvis.html` = UI legacy. **No** es el runtime OS.

---

## 2. Agentes — herramientas privadas

Cada agente es un worker registrable **sin modificar el núcleo** (Agent Manager + manifest).  
**Ejecución = Bloque 5**, no Bloque 4.

### Modelo de datos (objetivo a largo plazo)

| Campo | Descripción |
|-------|-------------|
| ID | Identificador estable |
| Nombre | Humano |
| Descripción | Qué hace |
| Especialidad | Dominio (frontend, SEO, QA, …) |
| Prompt | Base versionada (Prompt Registry) |
| Modelo IA | Provider/model **solo** vía Tool Registry |
| Herramientas | Allowlist de **tool capabilities** (nunca SDK directo) |
| Estado | idle / running / error / disabled |
| Coste | Acumulado / estimado |
| Tiempo estimado | SLA interno |
| Memoria | Scope en **Memory Engine** (no silo propio) |
| Logs | Runs |
| Permisos | RBAC / capability |
| Prioridad | Scheduling |
| Versionado | Semver del agente |

### Registro

- Alta/baja en caliente vía Agent Manager → **runtime en B5**.  
- En B4, Agent Manager existe solo como **frontera nombrada** (ADR-014).  
- Ligados a **módulos de servicio** (B5+).  
- No aparecen en web pública ni en `/r/[token]`.

### Estado as-is del código

`/api/chat` expone etiquetas (`asistente`, `investigador`, …) para el **chat comercial**.  
`agentes.html` usa `localStorage` cosmético.  
**Ninguno** es el runtime OS; no deben presentarse como tal en producto.

---

## 3. Catálogo orientativo (módulos internos)

Los nombres siguientes son **roles de entrega internos** (visión), no features del Bloque 4:

| Agente (ej.) | Especialidad en el ciclo |
|--------------|---------------------------|
| Comercial (ops) | Calificación lead → cliente (dentro del OS) |
| Planificador | Apoyo a JARVIS en fase Planificación |
| Diseño / Frontend / Backend | Ejecución según módulo web |
| Automatizaciones / Chatbots / IA | Ejecución según módulo de servicio |
| SEO / Contenido / RRSS | Ejecución marketing/contenido |
| QA | Control de calidad |
| DevOps | Empaquetado y deploy adapters |
| Seguridad | Revisores de políticas |
| Analítica | Informes de ciclo |
| CRM / Datos | Integridad de entidades |

La lista exacta vive en el registro de agentes (cuando exista en B5+), no hardcodeada en el núcleo.

---

## 4. Relación con capabilities y módulos (visión · B5+)

```
Proyecto declara capabilities
  → Capability Registry
  → JARVIS elige agentes que las implementan
  → Agent Manager ejecuta
  → Tools solo vía Tool Registry
  → Hechos en Memory Engine
  → Estados en Project Engine
```

```
Módulo "Desarrollo web"  → capabilities: ui.design, web.frontend, web.backend, qa.review, deploy.web
Módulo "Chatbot"         → capabilities: conv.design, integrate.api, qa.review
Módulo "Automatización"  → capabilities: workflow.design, data.sync, qa.review
```

Sustituir un agente no modifica el proyecto si la capability se mantiene.  
**Nada de esto es alcance del Bloque 4** (ADR-014).

---

## 5. Reglas de producto

1. Añadir un agente = manifest + prompt versionado + capabilities + tools allowlist — **cero cambios al core** (cuando exista B5).  
2. Prohibido exponer prompts o IDs de agentes al portal de revisión.  
3. El chat de la landing no registra agentes OS ni los enciende.  
4. Costes y logs solo en `/ops` con RBAC.  
5. Prohibido I/O externo fuera del Tool Registry (cuando exista runtime).  
6. Prohibido memoria crítica fuera del Memory Engine (cuando exista runtime).  
7. Prohibido presentar stubs o UIs legacy como Agent Runtime o JARVIS operativo.
