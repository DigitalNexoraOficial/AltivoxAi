# ADR-011 — Cinco motores del núcleo Altivox OS

- **Estado:** Aceptado  
- **Fecha:** 2026-08-07  
- **Decisores:** Owner (Xabier) · ampliación Bloque 0

---

## Contexto

Tras ADR-010 (Altivox OS), faltaba fijar **quién posee** proyectos, workflows, I/O externo, memoria y el desacople agente↔trabajo. Sin esto, JARVIS tendería a acumular responsabilidades y los agentes a acoplarse a vendors.

## Decisión

El núcleo oficial incluye, como componentes **independientes** con interfaces:

1. **Project Engine** — proyectos, estados, versiones, entregables, revisiones, despliegues. JARVIS no crea proyectos directamente.  
2. **Workflow Engine** — procesos reutilizables; no depende de JARVIS; JARVIS solo los ejecuta.  
3. **Tool Registry** — única vía a herramientas externas.  
4. **Memory Engine** — memoria central única; sin silos críticos en agentes.  
5. **Capability Registry** — los proyectos declaran capabilities; JARVIS mapea a agentes.

## Consecuencias

- Sustitución de agentes y de providers sin reescribir proyectos.  
- Superficie de seguridad centralizada en Tool Registry + RBAC.  
- Implementación por fases: primero contratos/schema, luego runtime.  
- Documentación en [`core-engines.md`](../core-engines.md).

## Alternativas descartadas

| Alternativa | Rechazo |
|-------------|---------|
| JARVIS crea proyectos inline | Acopla orquestador al agregado Project |
| Agentes con SDKs directos a vendors | Inmantenible; secretos dispersos |
| Memoria por agente | Inconsistencia y fuga de verdad |
| Proyecto con `agent_id` fijo | Impide hot-swap |

## Referencias

- [`core-engines.md`](../core-engines.md)  
- [`architecture.md`](../architecture.md)  
- [`adr/ADR-010-altivox-os-pivot.md`](./ADR-010-altivox-os-pivot.md)
