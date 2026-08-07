# API — Contratos Altivox AI

Base: `https://www.altivoxai.es` (también previews Vercel).  
Implementación: `src/app/api/*/route.ts`.

---

## 1. Resumen

| Ruta | Auth | Público | Propósito |
|------|------|---------|-----------|
| `POST /api/lead` | No (público rate-limited) | Sí | Captura leads |
| `GET /api/lead` | — | Health/info limitada | Según implementación |
| `POST /api/chat` | No | Sí | Chat LLM |
| `POST /api/n8n` | Secret **o** JWT Supabase | No abierto | Bridge ops |
| `GET /api/site-settings` | No | Sí | Settings públicos |
| `GET /api/ig-image` | No | Sí | Redirect asset IG |

Todas las mutaciones relevantes aplican CORS allowlist + límites de tamaño donde aplica.

---

## 2. `POST /api/lead`

**Archivo:** `src/app/api/lead/route.ts`

### Entrada (allowlist de campos)

Campos típicos: `nombre`, `email`, `telefono`, `empresa`, `mensaje`, `fuente`, `tipo_interes`, industria/metadata segura.

**No** se confía en score/clasificación enviada por el cliente: el servidor calcula score/prioridad por `fuente`.

### Salida

- `201/200` JSON con ok + id si aplica.
- Errores genéricos (no filtrar stack).

### Side effects

1. Insert en Supabase `leads` (service role preferido).
2. Forward a `N8N_WEBHOOK_URL` con evento `lead.created` o `lead.hot`.

### Fuentes conocidas (producto)

`contact`, `booking`, `guia` / lead magnet, calculadora, auditoría, etc.  
Cada fuente tiene peso de scoring distinto (ver código).

---

## 3. `POST /api/chat`

**Archivo:** `src/app/api/chat/route.ts`

### Entrada

```json
{
  "message": "string ≤1000",
  "agent": "asistente|investigador|diseñador|auditoría|creativo|sistemas"
}
```

Aliases sin tilde aceptados (`disenador`, `auditoria`).

### Salida

```json
{ "reply": "...", "agent": "Asistente" }
```

(forma exacta según response builder del route)

### Límites

- Body ≤ 16KB
- ~10 req / IP / minuto (Map in-process — no durable)

### Providers

1. OpenRouter  
2. Gemini fallback  

Keys solo en env servidor.

---

## 4. `POST /api/n8n`

**Archivo:** `src/app/api/n8n/route.ts`

### Auth

- Header `x-altivox-secret: $N8N_SECRET` (timing-safe compare), **o**
- `Authorization: Bearer <supabase_access_token>` validado

Sin auth → rechazo. No hay emit público.

### Acciones (allowlist)

| action | Efecto |
|--------|--------|
| `ping` | Health |
| `emit` | Reenvía evento a webhook n8n (si permitido) |
| `update_lead` | Patch lead |
| `create_cliente` | Alta cliente |
| `update_cliente` | Patch cliente |

Campos sensibles allowlisted en el route (p.ej. `telefono`, estados).

### Admin client

`public/assets/js/n8n-bridge.js` → setea Bearer con session token tras login.

---

## 5. `GET /api/site-settings`

**Archivo:** `src/app/api/site-settings/route.ts`

### Salida

```json
{
  "settings": {
    "brand": { "name", "mark", "tagline", "email", "whatsapp" },
    "hero": { "title", "titleAccent", "cta1", "cta2", "risk" },
    "contact": { "email", "whatsapp", "whatsappLabel" },
    "flags": { "chatEnabled", "bookingEnabled", "leadMagnetEnabled", "stickyCtaEnabled" },
    "social": { "linkedin", "instagram", "x" }
  }
}
```

Merge con defaults de código si falta clave en DB.

Escritura: **no** vía esta API pública; el admin escribe `site_settings` con cliente Supabase autenticado (`ajustes.html`).

---

## 6. `GET /api/ig-image?topic=`

**Archivo:** `src/app/api/ig-image/route.ts`

Redirect 302 a asset allowlisted (`chatbot|leads|agents` → `public/assets/ig/*.png`).  
Sin open redirect.

---

## 7. Eventos hacia n8n (salientes)

Payload conceptual:

```json
{
  "event": "lead.created|lead.hot|...",
  "ts": "ISO-8601",
  "data": { "lead": { "...campos CRM..." } }
}
```

Workflows: `n8n/workflows/01-lead-created.json`, `02-ops-contacted-onboarding.json`.

---

## 8. Deuda de API (prioridad)

1. Extraer helpers compartidos (CORS, rate limit, JSON errors) → `src/server/http.ts`.
2. Rate limit durable.
3. OpenAPI / Zod schemas compartidos cliente-servidor.
4. RBAC en `/api/n8n` (claim `role=admin`).
5. Versionado `/api/v1/...` cuando haya clientes externos.
6. Endpoint autenticado para escribir `site_settings` (en lugar de solo client SDK).

---

## 9. Consumidores

| Consumidor | APIs |
|------------|------|
| Landing React | lead, chat, site-settings |
| Admin HTML | n8n, Supabase directo, chat health |
| n8n Cloud | n8n (callback), webhooks salientes |
| IG/tools | ig-image |
