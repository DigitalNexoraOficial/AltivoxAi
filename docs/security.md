# Seguridad — Altivox AI

---

## 1. Postura actual (resumen)

**Fortalezas:** headers HTTP, allowlists en APIs, scoring de leads no confiable en cliente, n8n no abierto, RLS activado, CSP base.  
**Debilidades:** authz plana, admin HTML público + login client-only, rate limits no durables, CSP permisiva, secrets/project id con fallbacks en repo.

---

## 2. Controles existentes

| Control | Dónde |
|---------|--------|
| CSP, HSTS, X-Frame, nosniff, COOP, Referrer | `next.config.ts` (+ parcial `vercel.json`) |
| CORS allowlist | APIs lead/chat/n8n |
| Body size + field allowlist | `/api/lead`, `/api/chat`, `/api/n8n` |
| Timing-safe secret | `/api/n8n` ↔ `N8N_SECRET` |
| JWT opcional | Bearer Supabase en `/api/n8n` |
| Lead score server-side | `/api/lead` |
| IG redirect allowlist | `/api/ig-image` |
| RLS | SQL `leads`, `clientes`, `site_settings` |
| robots disallow admin/api | `public/robots.txt` |
| `poweredByHeader: false` | Next config |

---

## 3. Amenazas y mitigaciones

| Amenaza | Riesgo hoy | Mitigación actual | Siguiente control |
|---------|------------|-------------------|-------------------|
| Spam leads | Alto | Rate Map + validación email | Captcha + Upstash + anomaly |
| Abuso LLM (coste) | Alto | Rate Map 10/min | Cuota diaria + auth soft + WAF |
| Usuario Auth no-admin | Alto | Ninguno (RLS abierto) | Claim `role=admin` + RLS |
| XSS admin CDN | Medio | Confianza CDN | Self-host + CSP estricta |
| Exfil service role | Crítico si leak | Solo server | Secret scanning + rotación |
| Open admin URLs | Medio | Auth client | Middleware rewrite/auth |
| Prompt injection | Medio | Instrucciones soft | Guardrails + tool allowlist |
| PII en logs/n8n | Medio | Campos limitados | Redaction + retention |

---

## 4. Secretos y env

| Variable | Uso |
|----------|-----|
| `SUPABASE_URL` | API DB |
| `SUPABASE_ANON_KEY` / publishable | Cliente + API lectura |
| `SUPABASE_SERVICE_ROLE_KEY` | Writes server |
| `N8N_WEBHOOK_URL` | Emit eventos |
| `N8N_SECRET` | Auth bridge |
| `OPENROUTER_*` / `GEMINI_*` | Chat |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Fallback WA |
| `NEXT_PUBLIC_CAL_URL` | Booking |

**Regla:** nunca service role en HTML/admin JS.  
Anon key en `admin-core.js` es esperable pero el **project URL** debería venir de config build, no hardcode si es evitable.

---

## 5. Admin

- Rutas `/login.html`, `/dashboard.html`, … servidas como estáticos.
- `AltivoxAdmin.requireAuth` redirige si no hay sesión — **bypassable** viendo HTML/JS; la protección real debe ser RLS + (mejor) middleware/Edge.
- Navbar pública enlaza login → disclosure de entrada admin (aceptable si RBAC fuerte).

---

## 6. Checklist hardening (orden)

1. Rol `admin` en `app_metadata` + políticas RLS por rol.  
2. Validar rol en `/api/n8n` además de “JWT válido”.  
3. Middleware protegiendo `/dashboard.html` etc. o migrar a `/admin` SSR.  
4. Rate limit durable (Upstash) en lead + chat.  
5. Eliminar fallback service role en site-settings si falta anon.  
6. Reducir CSP (`unsafe-eval` fuera cuando admin migre).  
7. Captcha en lead.  
8. Audit log de mutaciones CRM/settings.  
9. Secret scanning en CI.  
10. Presupuesto LLM + alertas.

---

## 7. Cumplimiento / privacidad (mínimo)

- Formularios: informar uso de datos (legal footer existe; revisar textos).  
- Retención leads: definir política y job de borrado.  
- Encargados: Supabase, Vercel, n8n, LLM providers — documentar en privacidad.

Detalle de flujos de datos: [`flow.md`](./flow.md), [`database.md`](./database.md).
