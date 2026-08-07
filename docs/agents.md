# Agentes y JARVIS — Altivox OS (privados)

**Ámbito:** solo superficie **Altivox OS (`/ops`)**.  
Los clientes **no** ven ni invocan agentes.  
Chat público ≠ Agent runtime.

Visión: [`product-vision.md`](./product-vision.md) · Flujo: [`flow.md`](./flow.md)

---

## 1. JARVIS — Director de Proyectos

| Campo | Definición |
|-------|------------|
| **Qué es** | Orquestador / director de proyectos del OS |
| **Qué no es** | Chatbot · Project Engine · Tool Registry · ejecutor de entregables |
| **Objetivo** | Interpretar solicitudes, **ejecutar workflows**, pedir altas al Project Engine, resolver capabilities→agentes, coordinar el ciclo, detectar errores, informes |
| **Entradas** | Leads/clientes, eventos, Memory Engine, docs, módulos, Workflow definitions |
| **Salidas** | Órdenes a Project Engine / Workflow Engine / Agent Manager / Capability Registry; eventos `jarvis.*` |
| **Regla de oro** | No entrega código/artefactos él mismo · **no crea proyectos directamente** · no llama vendors sin Tool Registry |

Capacidades de producto (vía motores — ver [`core-engines.md`](./core-engines.md)):

- Solicitar creación/plan al **Project Engine**  
- Ejecutar **Workflow Engine**  
- Consultar **Capability Registry** y asignar agentes  
- Activar/detener agentes · consultar **Memory Engine**  
- Pedir review / entrega / deploy (Project Engine → Tool Registry)  
- Registrar todo lo ocurrido  

Implementación actual: `public/jarvis.html` = UI legacy. Core = Fase 4 roadmap.

---

## 2. Agentes — herramientas privadas

Cada agente es un worker registrable **sin modificar el núcleo** (Agent Manager + manifest).

### Modelo de datos (objetivo)

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

- Alta/baja en caliente vía Agent Manager.  
- Ligados a **módulos de servicio** (recomendados por tipo de proyecto).  
- No aparecen en web pública ni en `/r/[token]`.

### Estado as-is del código

`/api/chat` expone etiquetas (`asistente`, `investigador`, …) para el **chat comercial**.  
`agentes.html` usa `localStorage` cosmético.  
**Ninguno** es el runtime OS; no deben presentarse como tal en producto.

---

## 3. Catálogo orientativo (módulos internos)

Los nombres siguientes son **roles de entrega internos**, no features públicas:

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

La lista exacta vive en el registro de agentes, no hardcodeada en el núcleo.

---

## 4. Relación con capabilities y módulos

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

---

## 5. Reglas de producto

1. Añadir un agente = manifest + prompt versionado + capabilities + tools allowlist — **cero cambios al core**.  
2. Prohibido exponer prompts o IDs de agentes al portal de revisión.  
3. El chat de la landing no registra agentes OS ni los enciende.  
4. Costes y logs solo en `/ops` con RBAC.  
5. Prohibido I/O externo fuera del Tool Registry.  
6. Prohibido memoria crítica fuera del Memory Engine.
