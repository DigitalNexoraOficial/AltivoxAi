# Núcleo oficial — Motores de Altivox OS

**Estado:** Fuente de verdad (ampliación Bloque 0 · 2026-08-07)  
**ADR:** [`adr/ADR-011-core-engines.md`](./adr/ADR-011-core-engines.md)

Estos cinco componentes forman parte del **núcleo estable** de Altivox OS.  
Son independientes entre sí y se comunican solo mediante **interfaces**.  
JARVIS **orquesta**; no sustituye a estos motores.

```
                    ┌─────────────┐
                    │   JARVIS    │  (Director / orquestador)
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
   Workflow Engine   Capability      Project Engine
   (define + run     Registry        (proyectos,
    procesos)        (qué se         estados, versions,
                     necesita)       review, deploy)
           │               │               │
           └───────────────┼───────────────┘
                           ▼
                   Agent Manager
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        Tool Registry  Memory Engine  (Event Bus…)
        (I/O externo)  (memoria única)
```

---

## 1. Project Engine

**Módulo independiente** dueño del ciclo de vida del proyecto a nivel de datos y transiciones.

### Responsabilidades

- Crear proyectos  
- Gestionar estados (según [`flow.md`](./flow.md))  
- Controlar versiones  
- Gestionar entregables  
- Gestionar revisiones (`review_tokens`, comentarios, aprobaciones)  
- Gestionar despliegues (solicitudes + registro; adapters vía Tool Registry)

### Reglas

- **JARVIS no crea proyectos directamente.** Invoca la interfaz del Project Engine.  
- Ningún agente escribe estados de proyecto “a mano”; usan la API del engine (o eventos que el engine consume).  
- El portal `/r/[token]` solo habla con proyecciones seguras expuestas por este engine (vía API review).

### No hace

- Elegir qué agente concreto ejecuta una tarea (eso es JARVIS + Capability Registry + Agent Manager).  
- Hablar con GitHub/Vercel/LLM directamente (Tool Registry).

---

## 2. Workflow Engine

**Motor independiente** de procesos reutilizables (definiciones + ejecuciones).

### Función

Definir y ejecutar pipelines del tipo:

`Nuevo lead → Proyecto → Capacidades → Agentes → QA → Review → Deploy`

u otras plantillas por módulo de servicio.

### Reglas

- **No depende de JARVIS** para existir ni para definir workflows.  
- JARVIS (u otros callers autorizados) **únicamente puede ejecutarlos** / paramétrizarlos / pausarlos según permisos.  
- Un workflow orquesta llamadas a interfaces (Project Engine, Capability Registry, Agent Manager, etc.), no contiene I/O externo embebido.

### Independencia

Cambiar JARVIS no invalida las definiciones de workflow.  
Cambiar un agente no requiere reeditar el workflow si las **capabilities** se mantienen.

---

## 3. Tool Registry

**Única puerta** hacia herramientas externas.

### Regla absoluta

Ningún agente (ni JARVIS) se conecta directamente a:

GitHub · Vercel · Supabase · n8n · OpenAI · Anthropic · Gemini · Ollama · WordPress · FTP · APIs REST arbitrarias · correo · WhatsApp · etc.

Solo solicitan **capacidades de herramienta** al Tool Registry (`tool.invoke(capability, params)`).

### Responsabilidades

- Registrar adapters versionados  
- Credenciales / scopes  
- Rate limits y auditoría de uso  
- Normalizar errores y timeouts  

Añadir un proveedor nuevo = nuevo adapter en el registry, **sin** tocar agentes ni Project Engine.

---

## 4. Memory Engine

**Memoria central única** del sistema.

### Reglas

- Una sola memoria de verdad para hechos críticos (clientes, proyectos, decisiones, historial, prompts versionados referenciados, eventos, preferencias, aprobaciones, deploys).  
- Los agentes **no** almacenan información crítica en silos propios.  
- Lectura/escritura solo vía interfaces controladas + RBAC.  
- El Memory Engine puede internamente particionar por scope (`project`, `client`, `org`), pero el contrato hacia el resto del OS es único.

### Relación con docs `/docs` y MEMORY.md

`docs/MEMORY.md` es memoria **humana/arquitectónica** del repo.  
El Memory Engine es memoria **runtime** del OS (datos de negocio). Ambos coexisten; no se confunden.

---

## 5. Capability Registry

Desacopla **qué se necesita** de **quién lo hace**.

### Flujo de asignación (oficial)

```
Proyecto / Plan
  → declara Capabilities necesarias
  → JARVIS consulta Capability Registry
  → JARVIS elige Agent(s) que implementan esas capabilities
  → Agent Manager ejecuta
```

### Reglas

- Los proyectos **no** asignan agentes por ID de forma estructural.  
- Asignan (o se les calculan) **capabilities**.  
- Se puede sustituir un agente por otro con la misma capability **sin modificar** el proyecto.  
- Los módulos de servicio declaran capabilities típicas, no listas rígidas de agentes hardcodeadas en el núcleo.

---

## 6. Cómo encaja JARVIS

JARVIS puede:

- Interpretar solicitudes y decidir **ejecutar** un workflow  
- Pedir al Project Engine crear/actualizar proyectos  
- Resolver capabilities → agentes  
- Activar/detener agentes vía Agent Manager  
- Consultar Memory Engine y documentación  
- Pedir al Project Engine abrir review / registrar entrega  
- Solicitar deploys (confirmación humana) vía Project Engine → Tool Registry  

JARVIS **no** puede:

- Saltarse Project Engine para mutar el ciclo de vida  
- Llamar APIs externas sin Tool Registry  
- Guardar estado crítico fuera del Memory Engine  
- Atar proyectos a agentes concretos como contrato permanente  

---

## 7. Orden de implementación (referencia)

La visión queda cerrada aquí. Código en fases posteriores del [`roadmap.md`](./roadmap.md):

1. Seguridad (RBAC) — Bloque 1  
2. Domain + schema que soporte Project Engine  
3. Interfaces de los cinco motores (stubs → real)  
4. JARVIS como caller de esas interfaces  

No se requiere nuevo cambio de visión antes del Bloque 1.
