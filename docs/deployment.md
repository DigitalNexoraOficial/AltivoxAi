# Deployment — Altivox AI

---

## 1. Topología

```
GitHub DigitalNexoraOficial/AltivoxAi
        │
        ├─ main ──► Vercel Production ──► www.altivoxai.es
        └─ PR   ──► Vercel Preview
                │
                ├─ Supabase (Auth + Postgres)   [shared]
                ├─ n8n Cloud webhooks           [env]
                └─ OpenRouter / Gemini          [env]
```

DNS del dominio apunta a Vercel (estado verificado en operaciones previas).

---

## 2. Build

```bash
npm install
npm run build   # next build
npm start       # o runtime Vercel
```

Dev: `npm run dev --turbopack` (script `dev`).

Node: compatible con Next 16 / React 19 según lockfile.

---

## 3. Variables de entorno (Vercel)

| Nombre | Required prod | Notas |
|--------|---------------|-------|
| `SUPABASE_URL` | Sí | |
| `SUPABASE_ANON_KEY` o publishable | Sí | |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | Solo server |
| `N8N_WEBHOOK_URL` | Recomendado | Sin ella, leads no notifican |
| `N8N_SECRET` | Sí si se usa bridge | |
| `OPENROUTER_API_KEY` / URL model | Chat | |
| `GEMINI_API_KEY` | Fallback chat | |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Opcional | Default en código |
| `NEXT_PUBLIC_CAL_URL` | Opcional | Booking embed |

Tras cambios de env: redeploy.

---

## 4. Config archivos

| Archivo | Rol |
|---------|-----|
| `next.config.ts` | Headers seguridad, redirects `/index.html`→`/`, `/admin.html`→`/login.html` |
| `vercel.json` | Headers adicionales (solapar con Next — revisar duplicidad) |
| `public/robots.txt` / `sitemap.xml` | SEO estático |
| `supabase/sql/*` | Aplicar **manualmente** en Supabase (no CI hoy) |

---

## 5. Panel admin en producción

URLs:

- `https://www.altivoxai.es/login.html`
- `dashboard.html`, `clientes.html`, `ajustes.html`, `chatbot.html`, `jarvis.html`, `agentes.html`

Requisitos: usuario creado en Supabase Auth + SQL RLS aplicado.

---

## 6. n8n

1. Importar `n8n/workflows/*.json` o seguir `n8n/README.md`.
2. Activar Production URL del webhook.
3. Pegar en Vercel `N8N_WEBHOOK_URL`.
4. Configurar `N8N_SECRET` coincidente con header `x-altivox-secret`.
5. Ping desde Ajustes admin.

---

## 7. Checklist release

1. `npm run lint` + `npm run build` verdes.  
2. SQL aplicado en el proyecto Supabase correcto.  
3. Env Vercel completas.  
4. Smoke: `/`, POST lead test, login admin, site-settings GET, chat (si keys).  
5. Verificar CSP no rompe Cal/embeds.  
6. WhatsApp número en `site_settings` (no solo defaults código).  
7. Revisar preview URL antes de merge a `main`.

---

## 8. Rollback

- Vercel: promote deployment anterior.
- SQL: migraciones aditivas — evitar destructive; si hace falta, script inverso documentado en PR.
- n8n: desactivar workflow o apuntar webhook a no-op.

---

## 9. Deuda DevOps

- Sin CI GitHub Actions obligatorio en repo (confirmar).
- Sin migraciones Supabase automatizadas.
- Headers duplicados Next/Vercel.
- README desactualizado respecto a Next 16 y `/docs`.
