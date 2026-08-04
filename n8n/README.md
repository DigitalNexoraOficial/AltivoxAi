# n8n · AltivoxAI (plan FREE)

## Ya creado en tu cuenta n8n

| Recurso | ID / URL |
|---|---|
| Workflow | [Altivox Hub FREE](https://altivoxai.app.n8n.cloud/workflow/sQGNntDkScnbdK9o) |
| Webhook Production | `https://altivoxai.app.n8n.cloud/webhook/altivox-hub` |
| Data table inbox | `Altivox_Event_Inbox` |
| Data table hot | `Altivox_Hot_Queue` |
| Data table digests | `Altivox_Daily_Digests` |

Un solo workflow activo = menos consumo del free tier.

## Qué hace (sin costes extra)

1. **Webhook** — recibe eventos de la web/dashboard (`lead.*`, `cliente.*`, `jarvis.rescored`, `system.ping`).
2. **Triage P0/P1/P2** — prioriza leads calientes.
3. **Inbox + Hot Queue** — todo queda ordenado en Data Tables (gratis en n8n).
4. **Draft Gmail** (opcional) — borrador de alerta P0 a `altivoxaiofi@gmail.com` (no envía hasta que conectes Gmail).
5. **Digest diario 09:00** — health check de `/api/n8n` + `/api/chat` y resumen en `Altivox_Daily_Digests`.

## Tú debes completar (2 min)

1. Abre el workflow → **Publish / Activate**.
2. En el nodo **Draft Hot Alert** y **Draft Daily Digest** → conecta credencial **Gmail** (OAuth gratis de Google). Si no quieres Gmail aún, desactiva esos 2 nodos; el resto funciona.
3. En **Vercel** → Environment Variable:
   - `N8N_WEBHOOK_URL` = `https://altivoxai.app.n8n.cloud/webhook/altivox-hub`
4. Redeploy Vercel.
5. En [Ajustes](https://www.altivoxai.es/ajustes.html) → **Probar n8n**.

## Tips FREE

- No crees más workflows activos: amplía este hub.
- El digest diario ≈ 30 ejecuciones/mes.
- Mira la cola en n8n → Data tables → `Altivox_Hot_Queue`.
