# Roadmap — Altivox OS

Ordenado por **dependencias** y **riesgo**. Sin estimaciones calendarias.  
Visión: [`product-vision.md`](./product-vision.md) · Flujo: [`flow.md`](./flow.md)

---

## Estado del Bloque 0

| Bloque | Nombre | Estado |
|--------|--------|--------|
| **0** | Realineación documental Altivox OS | **Completado** |
| 1 | Seguridad OS (RBAC, RLS, middleware, rate limit) | Pendiente aprobación post-0 |
| 2+ | Ver fases abajo | Bloqueados hasta 0+1 |

---

## Fase 0 — Fuente de verdad (docs)

Documentar visión, tres superficies, ciclo de vida, módulos, obsolescencias.  
**Salida:** `/docs` = fuente oficial antes de código OS.

---

## Fase 1 — Seguridad del OS (Bloque 1 código)

1. RBAC: SuperAdmin · Admin · Editor · Agent · User  
2. RLS por rol en Supabase  
3. Middleware protegiendo `/ops` (y admin legacy mientras exista)  
4. Rate limit durable (lead + chat público)  
5. Sin fallback service role en lecturas públicas  
6. Bases de audit log  

**Salida:** nadie sin rol adecuado opera datos internos.

---

## Fase 2 — Dominio y schema del ciclo de vida

Tablas/entidades: `projects`, versiones, `review_tokens`, `agent_definitions`, `agent_runs`, artefactos, eventos.  
Capa `domain` + APIs internas mínimas.  
**Sin** UI premium todavía si no es necesaria para validar el dominio.

---

## Fase 3 — Shell Altivox OS (`/ops`)

Centro de operaciones App Router: navegación a Clientes, Leads, Proyectos, JARVIS, Agentes, etc.  
Migración gradual desde `public/*.html` (redirects temporales).

---

## Fase 4 — JARVIS Core (orquestador)

Módulos de núcleo: Memory, Context, Agent Manager, Prompt Registry, Task Scheduler, Workflow Engine, Event Bus, Logger, Monitoring, Config, Permissions, Tool Registry, Knowledge Base, API Gateway.  
Comunicación **solo por interfaces**.  
JARVIS **no** ejecuta entregables.

---

## Fase 5 — Runtime de agentes privados + módulos de servicio

Registro hot de agentes; primer módulo de servicio (p.ej. web o chatbot) como plugin.  
Ejecución, coste, logs, versionado.

---

## Fase 6 — Portal `/r/[token]`

Revisión, comentarios, cambios, aprobación — aislamiento estricto.

---

## Fase 7 — Entrega y despliegue

ZIP (código, docs, guía, env, README) + adapters (GitHub, Vercel, WordPress, FTP, …) con confirmación.

---

## Fase 8 — Hardening escaparate público

Performance (Three/móvil), SEO, a11y — **no bloquean** el núcleo OS pero mantienen captación.

---

## Fase 9 — Analítica, memoria avanzada, facturación

Métricas de ciclo de vida, presupuestos LLM, stub→facturación real.

---

## Obsoleto (roadmap anterior)

| Ítem antiguo | Estado |
|--------------|--------|
| “Plataforma pública multiagente” | **Obsoleto** |
| Fase E orientada a chat usuario + tools públicos | **Obsoleto** (reemplazada por Fases 4–5 internas) |
| JARVIS como chatbot / respuesta unificada al visitante | **Obsoleto** |
| T-023 Chat → create_lead tool de agentes OS | **Obsoleto** como diseño de agentes; captación lead sigue por `/api/lead` |
| Portal demo genérico como “cliente con IA” | **Obsoleto**; sustituye `/r/[token]` |
| Exponer organigrama de agentes al cliente | **Obsoleto** |

Lo reutilizable del roadmap viejo: seguridad (Fase B), dominio (C), admin→App Router (D, ahora `/ops`), SEO/perf (F/H parcial).

---

## Principios de ejecución

- Un bloque cada vez; aprobación humana antes de código.  
- No features visuales de marketing como prioridad del OS.  
- Cada fase deja el sistema desplegable.  
- Si hay que cambiar este roadmap: **parar**, proponer ADR, esperar OK.
