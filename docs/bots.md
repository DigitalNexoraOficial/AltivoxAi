# Bots y chat — Altivox AI

---

## 1. Estado actual

El “chatbot” es un widget de marketing con **selección de persona** (etiqueta), no un sistema multiagente con tools.

| Pieza | Ruta | Rol |
|-------|------|-----|
| UI | `src/components/chat/ChatWidget.tsx` | FAB + mensajes + selector de agente |
| API | `src/app/api/chat/route.ts` | Validación, rate limit, LLM |
| Admin | `public/chatbot.html` | Monitor / health |
| Catálogo UI | `public/agentes.html` | Toggles **localStorage** (no afectan API) |
| Gate | `site_settings.flags.chatEnabled` | Apaga widget |

### Agentes permitidos en API

```
asistente | investigador | diseñador | auditoría | creativo | sistemas
```

Implementación: mapa `ALLOWED_AGENTS` → nombre humano insertado en system prompt.  
**No hay** tools, memoria persistente, handoff, ni evaluación.

---

## 2. Contrato `/api/chat`

- **Método:** `POST` (+ `OPTIONS` CORS)
- **Límites:** body ≤ 16KB; mensaje ≤ 1000 chars; ~10 req/min/IP (memoria local)
- **Orígenes:** `altivoxai.es` + previews `*.altivoxai.vercel.app` + localhost
- **Proveedores:** OpenRouter primero; Gemini fallback
- **Secrets:** solo servidor (`OPENROUTER_*`, `GEMINI_*`)

Ver detalle en [`api.md`](./api.md).

---

## 3. Prompting actual (resumen)

System prompt ≈  
`Eres {agentName} del ecosistema AltivoxAi` + instrucciones de marca/venta prudente.

Riesgos: prompt injection suave; sin grounding en CRM; coste abierto al público.

---

## 4. Relación con JARVIS

Hoy JARVIS (`jarvis.html`) es **ops de leads** (score/reanálisis UI), no supervisor del chat.

**Objetivo:** JARVIS recibe mensaje → clasifica intención → elige agente worker → opcionalmente llama tools (`create_lead`, `book_call`, `fetch_offer`) → responde o escala a humano.

---

## 5. Otros “bots” / automatismos

| Sistema | Tipo | Notas |
|---------|------|-------|
| n8n lead workflows | Automatización | No conversacional |
| WhatsApp CTA | Deep link humano | No bot Business API aún |
| Lead auto_respuesta | Campo lead | Texto/servidor, no chat loop |

---

## 6. Roadmap bots (corto)

1. Unificar config de agentes en DB (`agent_definitions`) leída por `/api/chat` y admin.
2. Crear lead automáticamente tras intención comercial detectada.
3. Tool-calling mínimo: `get_offers`, `create_lead`, `whatsapp_link`.
4. Memoria de sesión (cookie/session id) con TTL.
5. Presupuesto diario LLM + cola.
6. Evals golden-set (10–20 prompts ES).

---

## 7. Reglas de producto

- No exponer claves en cliente.
- No confiar en `agent` libre del cliente sin allowlist.
- No vender capacidades de agentes en UI admin si no están cableadas al servidor.
- Todo agente nuevo: contrato en [`agents.md`](./agents.md) antes de merge.
