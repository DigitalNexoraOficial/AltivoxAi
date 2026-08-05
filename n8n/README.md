# n8n · AltivoxAI (plan FREE)

## Ya creado en tu cuenta n8n

| Recurso | Dónde |
|---|---|
| Workflow | n8n Cloud → proyecto Altivox → Hub FREE |
| Webhook Production | Copia la URL desde el nodo Webhook (no la publiques) |
| Data table inbox | `Altivox_Event_Inbox` |
| Data table hot | `Altivox_Hot_Queue` |
| Data table digests | `Altivox_Daily_Digests` |

Un solo workflow activo = menos consumo del free tier.

## Qué hace (sin costes extra)

1. **Webhook** — recibe eventos de la web/dashboard (`lead.*`, `cliente.*`, `jarvis.rescored`, `system.ping`).
2. **Triage P0/P1/P2** — prioriza leads calientes.
3. **Inbox + Hot Queue** — todo queda ordenado en Data Tables (gratis en n8n).
4. **Draft Gmail** (opcional) — borrador de alerta P0 a tu email ops.
5. **Digest diario 09:00** — health check de `/api/n8n` + `/api/chat`.

## Tú debes completar (2 min)

1. Abre el workflow → **Publish / Activate**.
2. Conecta Gmail OAuth en los nodos Draft (o desactívalos).
3. En **Vercel** → Environment Variables:
   - `N8N_WEBHOOK_URL` = Production URL del Webhook (privada)
   - `N8N_SECRET` = secreto compartido (recomendado)
4. Redeploy Vercel.
5. En Ajustes del panel → **Probar n8n**.

## Tips FREE

- No crees más workflows activos: amplía este hub.
- El digest diario ≈ 30 ejecuciones/mes.
- Mira la cola en n8n → Data tables → `Altivox_Hot_Queue`.

## Seguridad

- No commits de tokens Meta/Instagram, service role ni webhooks en el repo.
- Las claves de IA van solo en Vercel Env (`OPENROUTER_API_KEY` / `GEMINI_API_KEY`).
