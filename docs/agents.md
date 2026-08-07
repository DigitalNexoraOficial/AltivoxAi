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
| **Qué no es** | Chatbot, UI de marketing, ejecutor de entregables |
| **Objetivo** | Interpretar solicitudes internas, crear/planificar proyectos, asignar agentes, coordinar el ciclo de vida, detectar errores, pedir revisiones, generar informes, registrar todo |
| **Entradas** | Leads/clientes/proyectos, eventos, memoria, documentación, módulos de servicio |
| **Salidas** | Planes, asignaciones, órdenes a Agent Manager, eventos `project.*` / `jarvis.*`, informes |
| **Regla de oro** | **Nunca realiza el trabajo de entrega directamente** — siempre coordina agentes |

Capacidades documentadas (producto):

- Crear proyectos · interpretar solicitudes · asignar / activar / detener agentes  
- Consultar memoria y documentación · coordinar flujo · detectar errores  
- Solicitar revisiones · generar informes · registrar lo ocurrido  

Implementación actual: `public/jarvis.html` es **UI legacy de scoring**, no el orquestador. El Core se construye en Fase 4 del roadmap.

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
| Modelo IA | Provider/model vía Tool Registry |
| Herramientas | Allowlist de tools |
| Estado | idle / running / error / disabled |
| Coste | Acumulado / estimado |
| Tiempo estimado | SLA interno |
| Memoria | Scope permitido |
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

## 4. Relación con módulos de servicio

```
Módulo "Desarrollo web"  → sugiere agentes Frontend, Backend, Diseño, QA, DevOps
Módulo "Chatbot"         → sugiere agentes Conversacional, Integraciones, QA
Módulo "Automatización"  → sugiere agentes n8n/Workflow, Datos, QA
…
```

JARVIS elige subconjunto según brief del proyecto; el núcleo solo conoce la **interfaz** del módulo.

---

## 5. Reglas de producto

1. Añadir un agente = manifest + prompt versionado + tools allowlist — **cero cambios al core**.  
2. Prohibido exponer prompts o IDs de agentes al portal de revisión.  
3. El chat de la landing no registra agentes OS ni los enciende.  
4. Costes y logs solo en `/ops` con RBAC.
