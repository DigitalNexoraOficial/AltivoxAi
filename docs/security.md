# Seguridad — Altivox OS

Visión: [`product-vision.md`](./product-vision.md)

---

## 1. Modelo de amenaza por superficie

| Superficie | Actores | Riesgo principal | Control |
|------------|---------|------------------|---------|
| Web pública | Anónimos | Spam leads, abuso LLM chat, scraping | Rate limit durable, allowlists, validación |
| `/ops` | Staff | Acceso no autorizado a PII/proyectos/agentes | Auth + RBAC + RLS + middleware |
| `/r/[token]` | Cliente | Enumeración tokens, fuga de internos | Token opaco, scope mínimo, sin datos OS |
| APIs n8n | Automatismos | Write sin privilegio | Secret + rol Admin+ |

---

## 2. Controles as-is

Headers/CSP, allowlists API, scoring server-side, n8n no abierto, RLS básico “authenticated”, robots disallow admin.

**Gaps críticos para OS:** sin roles reales; admin HTML confía en cliente; rate limit en memoria; sin tokens de review; service role fallback en site-settings.

---

## 3. Controles to-be (Bloque 1+)

1. Roles: `superadmin` · `admin` · `editor` · `agent` · `user` en `app_metadata`.  
2. RLS por jerarquía de roles en leads/clientes/settings y futuras tablas de proyecto.  
3. Middleware: sesión + rol para `/ops` y HTML legacy.  
4. `/api/ops/*` solo servidor con `requireRole`.  
5. `/r/[token]` sin sesión staff; autorización = token válido no filtrable a internos.  
6. Rate limit Upstash en lead + chat.  
7. Audit log de mutaciones y de transiciones del ciclo de vida.  
8. Prompts/agentes/costes: nunca en JSON del portal ni de APIs públicas.

Detalle de implementación: pendiente **Bloque 1** (aprobación separada).

---

## 4. Secretos

Igual que antes (`SUPABASE_*`, `N8N_*`, LLM keys) + futuros: firmado de review tokens, storage de artefactos, credenciales de deploy adapters (vault / env por proyecto).

**Regla:** service role solo servidor OS; nunca en HTML ni en portal review.

---

## 5. Checklist priorizado

1. RBAC + RLS (Bloque 1)  
2. Middleware `/ops` + legacy  
3. Rate limit durable  
4. Quitar fallback service role lecturas públicas  
5. Diseño seguro `review_tokens`  
6. Audit log  
7. CSP más estricta al migrar admin a App Router  
8. Captcha leads (opcional)  
9. Presupuesto LLM en OS  

---

## 6. Cumplimiento

PII de clientes en OS; el portal review solo muestra lo necesario del entregable.  
Retención y borrado: definir en fase dominio + legal.
