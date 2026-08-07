# Visión de producto — Altivox OS

**Nombre interno:** Altivox OS  
**Marca comercial:** AltivoxAi / Altivox AI  
**Dominio público:** https://www.altivoxai.es  
**Documento oficial de visión:** este archivo (Bloque 0 · 2026-08-07)

---

## 1. Qué es Altivox OS

Altivox OS **no** es solo un dashboard.

Es el **Sistema Operativo interno** de Altivox AI: el núcleo desde el que se gestiona **toda la empresa** — comercial, entrega, calidad, agentes privados, automatizaciones, documentación, analítica y despliegues.

La web pública es el **escaparate y la puerta de entrada**.  
Toda la inteligencia operativa vive **dentro** de Altivox OS.

---

## 2. Qué no es

- No es una plataforma pública de agentes de IA.
- Los clientes **nunca** interactúan directamente con agentes, prompts ni herramientas internas.
- JARVIS **no** es un chatbot: es el **Director de Proyectos** (orquestador).
- El chat de la web pública es solo **comercial / captación**, no el runtime de agentes.

---

## 3. Tres superficies oficiales

| # | Superficie | Ruta | Audiencia | Propósito |
|---|------------|------|-----------|-----------|
| 1 | **Web pública** | `/`, `/casos/*`, etc. | Visitantes / leads | Marketing, captación, información, chat comercial, formularios |
| 2 | **Altivox OS** | `/ops` | Equipo interno (RBAC) | Centro de operaciones: CRM, clientes, proyectos, JARVIS, agentes, automatizaciones, docs, analítica, despliegues |
| 3 | **Portal de revisión** | `/r/[token]` | Cliente del proyecto | Solo entregables: ver, comentar, pedir cambios, aprobar/rechazar — **sin** datos internos, agentes ni prompts |

Cualquier UI futura debe clasificarse en una de estas tres superficies.

---

## 4. Principio arquitectónico obligatorio

> **El núcleo nunca se modifica para añadir un servicio nuevo.**  
> Todo se amplía mediante **módulos / plugins independientes** conectados por **interfaces bien definidas**.

Altivox OS debe poder gestionar **cualquier servicio** que ofrezca la agencia — desarrollo web, automatizaciones, agentes IA, chatbots, marketing, contenido, integraciones, etc. — registrando un módulo de servicio, no reescribiendo el core.

Detalle técnico: [`architecture.md`](./architecture.md), [`adr/ADR-010-altivox-os-pivot.md`](./adr/ADR-010-altivox-os-pivot.md).

---

## 5. Ciclo de vida oficial de un proyecto

### Visión a largo plazo

```
Lead → Cliente → Proyecto → Planificación → Capabilities → Agentes
  → Ejecución → QA → Versión → Review URL → Cambios ⟲ → Aprobación
  → Entrega → Deploy opcional → Mantenimiento
```

### Fase Bloque 2 (Project Engine)

Estados en dominio: `draft|planning|in_progress|qa|review|approved|delivered|maintenance|cancelled|archived`.

- Transiciones **manuales vía OPS** hasta Workflow/JARVIS/agentes.  
- `review` = fase; sin portal/tokens aún.  
- Sin deploy ni capabilities en el proyecto.

Detalle: [`flow.md`](./flow.md), [`core-engines.md`](./core-engines.md), [`ADR-013`](./adr/ADR-013-project-engine.md).

---

## 6. Capacidades del Centro de Operaciones (`/ops`)

Mínimo funcional a medio plazo:

- Dashboard principal  
- Clientes · Leads · CRM · Proyectos  
- JARVIS · Agentes · Herramientas · Workflows · Automatizaciones  
- Conversaciones · Memoria · Logs · Analíticas  
- Configuración · Despliegues  
- Facturación (**preparado**, no necesariamente cobrando en v1)

---

## 7. Visión 3–5 años

### Años 1 — Cimientos del OS

- RBAC sólido; dominio Proyectos; shell `/ops`; JARVIS orquestador mínimo.
- Un puñado de módulos de servicio (p.ej. web, chatbot, automatización).
- Review URL + entrega ZIP; deploy asistido con confirmación.
- Memoria y event bus persistentes; auditoría completa del ciclo de vida.

### Años 2–3 — Empresa multi-cliente

- Decenas de proyectos concurrentes con colas y presupuestos LLM.
- Catálogo de módulos/plugins versionados (marketplace interno).
- Nuevos canales de captación y ops: WhatsApp Business, correo, voz.
- Integración con múltiples proveedores de IA (OpenAI, Anthropic, Gemini, Ollama, etc.) vía Tool Registry — **sin tocar el núcleo**.
- Despliegues automatizados a GitHub, Vercel, WordPress, FTP u otros adapters.
- QA agent + políticas de calidad por tipo de servicio.
- Analítica de margen, coste por agente y SLA por cliente.

### Años 3–5 — Sistema Operativo de agencia

- Altivox OS como sistema de record de toda la empresa (comercial + delivery + finance stub → full).
- Multi-equipo / multi-sede con RBAC fino.
- Knowledge base corporativa consultable por JARVIS y agentes autorizados.
- Autoscaling de workers de agentes; evaluación continua de calidad.
- Posible white-label del **portal de revisión** (nunca del runtime de agentes).
- Facturación, contratos y renovaciones de mantenimiento integrados al ciclo de vida.

### Principios que no cambian en 5 años

1. Tres superficies (pública / OS / review).  
2. Clientes sin acceso a agentes.  
3. JARVIS orquesta; no ejecuta trabajo de entrega.  
4. Extensión solo por módulos e interfaces.  
5. Todo el ciclo de vida queda registrado.

---

## 8. Relación con el código actual (honestidad)

Hoy existen: landing Next.js, admin HTML (`public/*.html`, temporal ADR-001), APIs lead/chat/n8n, CRM ligero Supabase, **Security (B1)**, **Project Engine (B2)** y **shell `/ops` App Router (B3)** con UI de proyectos.

**Aún no:** portal `/r/[token]`, JARVIS runtime, motores Workflow/Tool/Memory/Capability, Agent Runtime, CRM App Router.

Esta visión es la **fuente oficial de verdad** para el diseño; la implementación sigue el [`roadmap.md`](./roadmap.md) bloque a bloque.
