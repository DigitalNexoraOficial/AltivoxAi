# Base de datos — Altivox AI

**Motor:** PostgreSQL vía Supabase  
**SQL en repo:** `supabase/sql/*` (+ `chat-leads.sql` en root, duplicado parcial)

---

## 1. Diagrama lógico

```
auth.users (Supabase Auth)
        │
        ▼ (RLS: authenticated)
   ┌─────────┐     convert      ┌──────────┐
   │  leads  │ ───────────────► │ clientes │
   └─────────┘                  └──────────┘
        │
        │ events (opcional)
        ▼
 automation_events

 site_settings (key → jsonb)  ←── Admin Ajustes / API pública lectura
```

No hay tablas de agentes, tickets, blog posts ni sesiones de chat en SQL actual.

---

## 2. Tablas

### 2.1 `leads`

**Origen:** tabla preexistente; columnas/RLS en `auth-admin-only.sql` / `chat-leads.sql`.

| Columna (añadidas) | Uso |
|--------------------|-----|
| `fuente` | Origen lead (contact, booking, guia…) |
| `tipo_interes` | Interés declarado |
| `mensaje` | Texto libre |
| `score` | Score servidor |
| `clasificacion` | hot/warm/cold u equivalente |
| `prioridad` | Prioridad ops |
| `auto_respuesta` | Texto/flag respuesta |
| `estado` | Pipeline lead |
| `ultimo_contacto` | Timestamp seguimiento |

**RLS (resumen):**  
- `anon`: insert  
- `authenticated`: select/update  

⚠️ `with check (true)` en inserts anon → superficie de spam; mitigar en API + rate limit + (futuro) captcha.

### 2.2 `clientes`

**Archivo:** `supabase/sql/clientes.sql`

Campos típicos: `nombre`, `empresa`, `email`, `telefono`, `sector`, `notas`, `plan`, `estado`, `lead_id`, valor, origen, timestamps.

**RLS:** authenticated all (`using (true)` / `with check (true)`).

### 2.3 `site_settings`

**Archivo:** `supabase/sql/site-settings.sql`

| Columna | Tipo | Notas |
|---------|------|-------|
| `key` | text PK | `brand`, `hero`, `contact`, `flags`, `social` |
| `value` | jsonb | Documento de settings |
| `updated_at` | timestamptz | |
| `updated_by` | text | |

**RLS:**  
- anon + authenticated: **select**  
- authenticated: **all** (escritura)

Seed + `UPDATE` de WhatsApp documentado en el SQL.

### 2.4 `automation_events` (opcional)

**Archivo:** `supabase/sql/n8n.sql`  
Log de ops/automatización.

---

## 3. Acceso desde la app

| Actor | Modo |
|-------|------|
| `/api/lead`, `/api/n8n` writes | Service role / REST server (bypass RLS) |
| `/api/site-settings` | Anon key (o service fallback — evitar) |
| Admin HTML | Supabase JS CDN + sesión usuario (RLS) |

URL/proyecto aparecen con fallbacks en código; preferir siempre env.

---

## 4. Config CLI

`config.toml` — `project_id` + stub `functions.jarvis-chat` **sin código** en repo.  
No hay carpeta `supabase/functions/`.

---

## 5. Problemas conocidos

1. **Sin roles:** cualquier usuario Auth es “admin” a efectos RLS.
2. **Sin audit log** de cambios CRM/settings.
3. **Duplicación SQL** root vs `supabase/sql`.
4. **Sin migraciones versionadas** (solo scripts manuales en SQL Editor).
5. **Sin FKs estrictas** documentadas lead↔cliente en todos los entornos.
6. Chat **sin tabla** de conversaciones.

---

## 6. Modelo objetivo (incremental)

```
leads, clientes          — existentes
site_settings            — existente
agent_definitions        — prompts, tools, enabled
conversations/messages   — chat sessions
automation_events        — existente ampliar
audit_log                — who/when/what
content_posts            — blog
tickets                  — atención
```

Principio: **migración aditiva**, sin romper admin HTML ni APIs públicas.

---

## 7. Operación

1. Ejecutar scripts en Supabase SQL Editor (orden: auth-admin → clientes → site-settings → n8n).
2. Verificar RLS con usuario anon vs authenticated.
3. Nunca commitear service role key.
4. Tras cambiar seeds, si hay `on conflict do nothing`, aplicar `UPDATE` explícito (ej. WhatsApp).
