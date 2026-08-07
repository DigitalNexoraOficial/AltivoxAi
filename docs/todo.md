# TODO — Backlog priorizado Altivox AI

Leyenda: **P0** bloqueante · **P1** alto · **P2** medio · **P3** mejora  
Estado: `open` salvo nota.  
Regla: no implementar sin confirmación explícita (Fase 5).

---

## P0 — Seguridad / datos

| ID | Tarea | Notas |
|----|-------|-------|
| T-001 | RBAC admin + RLS por rol | Ver security.md |
| T-002 | Rate limit durable lead+chat | Upstash u equivalente |
| T-003 | Validar rol en `/api/n8n` | No basta JWT válido |
| T-004 | Sincronizar WhatsApp en `site_settings` prod | Si seed antiguo |
| T-005 | Quitar fallback service role en site-settings | |

## P1 — Arquitectura / deuda

| ID | Tarea | Notas |
|----|-------|-------|
| T-010 | Extraer `src/server/http` (CORS, errors, rate) | DRY APIs |
| T-011 | Dominio Lead/Cliente/Events | domain layer |
| T-012 | Deduplicar n8n-bridge TS/JS | Un contrato |
| T-013 | Deduplicar SQL leads | Eliminar o reexport root |
| T-014 | Eliminar dead Three/FX/`clsx` | Tras confirmación |
| T-015 | Gate `ScrollAIBackground` en móvil | performance.md |
| T-016 | Documentar/actualizar README → `/docs` | |

## P1 — Producto agentes

| ID | Tarea | Notas |
|----|-------|-------|
| T-020 | Spec JARVIS orchestrator | agents.md |
| T-021 | `agent_definitions` table | No localStorage |
| T-022 | Cablear agentes.html → servidor | O retirar UI engañosa |
| T-023 | Chat → create_lead tool | bots.md |

## P2 — Admin / UX

| ID | Tarea | Notas |
|----|-------|-------|
| T-030 | Plan migración admin → App Router | roadmap Fase D |
| T-031 | Labels a11y en Contact | WCAG |
| T-032 | Focus trap modales | Booking/Services |
| T-033 | Unificar motion stack | Framer vs GSAP |

## P2 — SEO / contenido

| ID | Tarea | Notas |
|----|-------|-------|
| T-040 | OG image 1200×630 | seo.md |
| T-041 | `generateMetadata` casos | |
| T-042 | FAQPage JSON-LD | |
| T-043 | sitemap dinámico | |
| T-044 | Ruta `/blog` | cmsPosts |

## P3 — CRM / ops

| ID | Tarea | Notas |
|----|-------|-------|
| T-050 | Actividades en clientes | |
| T-051 | Tickets atención | |
| T-052 | Portal real vs demo | Decidir producto |
| T-053 | CI lint+build+e2e smoke | |
| T-054 | Vercel Analytics / Speed Insights | |

## Hecho recientemente (historial corto)

| Ítem | Ref |
|------|-----|
| Admin premium + site_settings | main `b8ca1b8` |
| Hardening APIs pre-prod | `67a1ae9` |
| Mobile FAB / sticky CTA | `fe3fa7f` |
| Docs arquitectura Fases 1–4 | este PR |
| WhatsApp número (rama separada) | PR phone si aplica |

Actualizar este archivo en cada PR relevante (no como diario; solo ítems accionables).
