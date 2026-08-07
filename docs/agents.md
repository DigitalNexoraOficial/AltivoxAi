# Agentes y JARVIS — Altivox OS (privados)

**Ámbito:** solo superficie **Altivox OS (`/ops`)**.  
Los clientes **no** ven ni invocan agentes.  
Chat público ≠ Agent runtime. JARVIS ≠ chatbot.

Visión: [`product-vision.md`](./product-vision.md) · Flujo: [`flow.md`](./flow.md)  
B4: [`ADR-014`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md) · B5: [`ADR-015`](./adr/ADR-015-bloque-5-agent-runtime.md)

---

## 0. Alcance por bloque (obligatorio)

| Bloque | Qué cubre |
|--------|-----------|
| **4** · **cerrado** | JARVIS Core caller + fronteras TypeScript de motores. **Sin** Agent Runtime. |
| **5** · ADR-015 | **Agent Runtime** + Agent Manager runtime + primer service module + Tool/Memory/Capability **mínimos**. |
| **6** | Review Engine / portal — sin exponer agentes. |
| **7** | Deploy / ZIP — Tool Registry ampliado; sin agentes en el portal. |

Este documento mezcla **visión a largo plazo** y **cortes por bloque**.  
Lo implementado hoy ≠ visión completa.

---

## 1. JARVIS — Director de Proyectos

| Campo | Definición |
|-------|------------|
| **Qué es** | Orquestador / director de proyectos del OS |
| **Qué no es** | Chatbot · Project Engine · Tool Registry · ejecutor de entregables |
| **Regla de oro** | No entrega artefactos él mismo · **no crea proyectos directamente** · no llama vendors sin Tool Registry |

### Estado real (código)

- **JARVIS Core** (`src/core/jarvis`, B4): caller → use-cases del Project Engine.  
- `public/jarvis.html`: UI legacy; **no** es el Core.  
- Orquestación de **Agent Runtime**: pendiente Bloque 5 (ADR-015).

### Visión (largo plazo — no todo es B5)

Interpretar solicitudes, ejecutar workflows, pedir altas al PE, resolver capabilities→agentes, coordinar ciclo, informes.  
Workflow runtime y Review/Deploy = **fuera de B5**.

---

## 2. Agentes — herramientas privadas

### Corte Bloque 5 (ADR-015)

- Agent Runtime: ciclo de vida de runs.  
- Agent Manager runtime: registro por manifest.  
- Un primer service module.  
- Tool Registry **mínimo** (LLM aprobado).  
- Memory / Capability **mínimos** (runs + resolución de manifests).  
- **No:** Review, Deploy, Workflow runtime, Tool de vendors de entrega, chat público.

### Visión a largo plazo (modelo de datos objetivo)

| Campo | Descripción |
|-------|-------------|
| ID / Nombre / Descripción / Especialidad | Identidad |
| Prompt | Base versionada |
| Modelo IA | Solo vía Tool Registry |
| Herramientas | Allowlist de tool capabilities |
| Estado | idle / running / error / disabled |
| Coste / SLA / Logs / Versionado | Ops internos |
| Memoria | Scope Memory Engine (no silo) |
| Permisos | RBAC / capability |

### Estado as-is del código (además de B4)

`/api/chat` = tonos comerciales.  
`agentes.html` = cosmético (`localStorage`).  
**Ninguno** es Agent Runtime OS.

---

## 3. Catálogo orientativo (visión · no checklist B5)

Roles internos de ejemplo (Planificador, Frontend, QA, …) viven en el registro cuando exista B5+; no hardcodear en el núcleo.

---

## 4. Relación con capabilities y módulos (visión · B5+ según ADR-015)

```
Service module declara capabilities (manifest)
  → Capability Registry (mínimo en B5)
  → JARVIS / OPS elige agentes
  → Agent Manager + Agent Runtime ejecutan
  → Tools solo vía Tool Registry (mínimo LLM en B5)
  → Hechos de run en Memory (mínimo)
  → Estados de proyecto en Project Engine
```

**Nada de esto es Review/Deploy.** Binding de capabilities en `projects` = **fuera** de B5 (ADR-013).

---

## 5. Reglas de producto

1. Añadir un agente = manifest + capabilities + tools allowlist — **cero cambios al core** (cuando exista B5).  
2. Prohibido exponer prompts o IDs de agentes al portal de revisión (B6).  
3. El chat de la landing no registra agentes OS ni los enciende.  
4. Costes y logs solo en `/ops` con RBAC.  
5. Prohibido I/O externo fuera del Tool Registry.  
6. Prohibido presentar stubs o UIs legacy como Agent Runtime.
