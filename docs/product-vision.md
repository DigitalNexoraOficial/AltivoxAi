# Visión de producto — Altivox OS

**Nombre interno:** Altivox OS  
**Marca comercial:** AltivoxAi / Altivox AI  
**Dominio público:** https://www.altivoxai.es  
**Documento oficial de visión:** este archivo (Bloque 0 · 2026-08-07)  
**Actualizado:** 2026-08-07 · Bloque 6 cerrado (ADR-016)

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
- La fase de proyecto `review` **no** es el portal cliente (ADR-016).

---

## 3. Tres superficies oficiales

| # | Superficie | Ruta | Audiencia | Propósito |
|---|------------|------|-----------|-----------|
| 1 | **Web pública** | `/`, `/casos/*`, etc. | Visitantes / leads | Marketing, captación, información, chat comercial, formularios |
| 2 | **Altivox OS** | `/ops` | Equipo interno (RBAC) | Centro de operaciones: CRM, clientes, proyectos, JARVIS, agentes, automatizaciones, docs, analítica, despliegues |
| 3 | **Portal de revisión** | `/r/[token]` | Cliente del proyecto | Solo entregables: ver, comentar, pedir cambios, aprobar/rechazar — **sin** datos internos, agentes ni prompts · **implementado ADR-016** |

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

### Fase Bloque 2 (Project Engine) — cerrada

Estados en dominio: `draft|planning|in_progress|qa|review|approved|delivered|maintenance|cancelled|archived`.

- Transiciones **manuales vía OPS** (PE) hasta Workflow runtime pleno.  
- `review` = fase; portal/tokens = **Bloque 6** (ADR-016).  
- Sin deploy ni capabilities en el proyecto.

### Fases B4–B5 — cerradas

- **B4 (ADR-014):** JARVIS Core caller + fronteras de motores.  
- **B5 (ADR-015):** Agent Runtime + módulo `web` + Tool/Memory/Capability mínimos — **agentes internos**.

### Fase Bloque 6 — cerrada (ADR-016)

- Review Engine independiente + `/r/[token]`.  
- **No** Deploy, ZIP, hosting, agentes al cliente, chat público, marketplace.  
- Aprobación cliente **no** cambia automáticamente el estado PE.

| Bloque | Producto | Estado |
|--------|----------|--------|
| 5 | Agent runtime + service modules | **Cerrado** |
| 6 | Review Engine + `/r/[token]` | **Cerrado** |
| 7 | Entrega ZIP + Deployment Engine | Pendiente |

Detalle: [`flow.md`](./flow.md), [`core-engines.md`](./core-engines.md), [`ADR-016`](./adr/ADR-016-bloque-6-review-engine.md).

---

## 6. Capacidades del Centro de Operaciones (`/ops`)

Mínimo funcional a medio plazo:

- Dashboard principal  
- Clientes · Leads · CRM · Proyectos  
- JARVIS · Agentes · Herramientas · Workflows · Automatizaciones  
- Conversaciones · Memoria · Logs · Analíticas  
- Configuración · Despliegues  
- Emisión/revocación de review (B6)  
- Facturación (**preparado**, no necesariamente cobrando en v1)

---

## 7. Visión 3–5 años

### Años 1 — Cimientos del OS

- RBAC sólido; dominio Proyectos; shell `/ops`; fronteras JARVIS + motores (B4); Agent runtime y módulos (B5).
- Un puñado de módulos de servicio (p.ej. web, chatbot, automatización) — tras B5.
- Review URL + entrega ZIP; deploy asistido con confirmación — B6/B7.
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

Hoy existen: landing Next.js, admin HTML (`public/*.html`, temporal ADR-001), APIs lead/chat/n8n, CRM ligero Supabase, **Security (B1)**, **Project Engine (B2)**, **shell `/ops` (B3)**, **JARVIS Core (B4)**, **Agent Runtime + módulo web (B5)**, **Review Engine + `/r/[token]` (B6)**.

**Aún no:** Deploy/ZIP (B7), Workflow runtime pleno, CRM App Router, Memory KB corporativa.

Esta visión es la **fuente oficial de verdad** para el diseño; la implementación sigue el [`roadmap.md`](./roadmap.md) bloque a bloque.  
**No escribir código de B7** hasta OK explícito.
