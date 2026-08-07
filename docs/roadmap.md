# Roadmap — Altivox AI

Horizonte de producto hacia **agencia de automatización inteligente** multiagente.  
Sin estimaciones en días/semanas: ordenado por **dependencias técnicas** y **riesgo**.

---

## Fase A — Cimientos (ahora)

Documentación `/docs` · estabilizar producción · WhatsApp/settings reales · no romper embudo.

**Salida:** equipo alineado; deuda visible; cero cambios improvisados.

---

## Fase B — Seguridad y fiabilidad (bloqueante para escala)

1. RBAC admin (`app_metadata.role`) + RLS por rol.  
2. Middleware / protección admin.  
3. Rate limit durable (lead + chat).  
4. Eliminar fallbacks peligrosos (service role en lecturas).  
5. Audit log mutaciones.

**Salida:** panel operable por equipo sin riesgo de Auth “cualquiera”.

---

## Fase C — Dominio unificado

1. `src/server/` + `src/domain/` (Lead, Cliente, Settings, Events).  
2. Deduplicar n8n-bridge / SQL.  
3. Zod/OpenAPI contracts.  
4. Limpiar dead code (Three hero unused, `clsx`, `_legacy`).

**Salida:** un solo lenguaje de dominio para web + admin + agentes.

---

## Fase D — Admin App Router

1. Migrar login/dashboard/clientes/ajustes a `/admin/*`.  
2. Mantener HTML como redirect temporal.  
3. Compartir componentes UI con design system.

**Salida:** un stack; CSP más estricta posible.

---

## Fase E — JARVIS real

1. Tabla `agent_definitions`.  
2. Orquestador: intent → agent → tools.  
3. Tools: `create_lead`, `get_offers`, `booking_link`.  
4. Memoria sesión + evals.  
5. Desactivar toggles cosméticos localStorage.

**Salida:** multiagente con contratos ([`agents.md`](./agents.md)).

---

## Fase F — Contenido y SEO

1. `/blog` MDX o headless.  
2. Metadata/OG/sitemap dinámicos.  
3. Schema FAQ/Offer.  
4. CWV: gate Three móvil.

**Salida:** adquisición orgánica escalable.

---

## Fase G — CRM y atención

1. Pipeline kanban real + actividades.  
2. Tickets / SLA.  
3. WhatsApp Business API (opcional).  
4. Portal cliente conectado a datos reales (reemplaza demo).

**Salida:** operación de agencia, no solo captación.

---

## Fase H — Analítica y coste IA

1. Event pipeline (funnel + agent metrics).  
2. Presupuestos LLM.  
3. Dashboards ROI por agente/fuente.

---

## Principios de roadmap

- Cada fase deja el sistema **desplegable**.  
- No reescribir landing completa para añadir agentes.  
- Preferir **adapters** sobre big-bang.  
- Toda propuesta de implementación: lista de archivos + porqués → **confirmación humana** (Fase 5 del briefing).
