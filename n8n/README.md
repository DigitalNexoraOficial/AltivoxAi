# AltivoxAI ↔ n8n

## 1. Importar workflows
- `n8n/workflows/01-lead-created.json`
- `n8n/workflows/02-ops-contacted-onboarding.json`

Activa el workflow y copia la **Production URL** del nodo Webhook.

## 2. Variables en Vercel
| Variable | Uso |
|---|---|
| `N8N_WEBHOOK_URL` | URL Production del Webhook n8n |
| `N8N_WEBHOOK_TEST` | (opcional) URL de test |
| `N8N_SECRET` | Secreto compartido para acciones inbound |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo si n8n escribe vía `/api/n8n` |

Redeploy después de guardar.

## 3. Probar
1. Abre `https://www.altivoxai.es/ajustes.html`
2. Pulsa **Probar n8n**
3. En n8n → Executions debe aparecer `system.ping`

## 4. Eventos que emite Altivox
`lead.created` · `lead.hot` · `lead.updated` · `lead.contacted` · `cliente.created` · `cliente.updated` · `cliente.deleted` · `cliente.touched` · `jarvis.rescored` · `system.ping`

Payload típico:
```json
{
  "source": "altivoxai",
  "event": "lead.created",
  "ts": "2026-08-04T12:00:00.000Z",
  "data": { "...lead fields..." }
}
```

## 5. n8n → Altivox (inbound)
`POST https://www.altivoxai.es/api/n8n`  
Header: `x-altivox-secret: <N8N_SECRET>`

```json
{ "action": "update_lead", "id": "<uuid>", "patch": { "estado": "contactado" } }
```

Alternativa: nodo **Supabase** en n8n (recomendado para lecturas/escrituras masivas).

## 6. Backup recomendado
Supabase → Database Webhooks → tabla `leads` INSERT → misma URL de n8n.
