# Chat y bots — superficies públicas vs OS

---

## 1. Separación obligatoria

| Sistema | Superficie | Rol |
|---------|------------|-----|
| Chat comercial | Web pública | Captación, FAQ ligera, handoff a formulario/WA |
| Agent runtime | Altivox OS `/ops` | Ejecución de trabajo de proyectos |
| JARVIS | Altivox OS `/ops` | Orquestación — **no** chat de marketing |

**Prohibido:** que el chat público active Agent Manager, lea prompts de agentes OS o cree runs de entrega.

---

## 2. Estado as-is (código)

| Pieza | Path | Notas |
|-------|------|-------|
| UI | `ChatWidget.tsx` | Selector de “agentes” = tonos de prompt |
| API | `/api/chat` | Allowlist de nombres → system prompt; OpenRouter/Gemini |
| Admin | `chatbot.html` | Monitor legacy |
| Flags | `site_settings.flags.chatEnabled` | Gate |

Estas etiquetas **no** son el catálogo OS. En producto/UI interna deben etiquetarse como “modo conversacional” o similar para no confundir con agentes de entrega.

---

## 3. To-be chat público

- Mantener rate limit + allowlist.  
- Opcional: crear lead vía `/api/lead` desde intención comercial (aplicación **lead**, no tool de agente OS).  
- Sin memoria de proyecto, sin tools de deploy/CRM interno.

---

## 4. To-be bots/agentes OS

Ver [`agents.md`](./agents.md) · contrato B4: [`ADR-014`](./adr/ADR-014-bloque-4-jarvis-motores-interfaces.md).

**Visión de producto (largo plazo):** agentes, workflows, capabilities, memory y herramientas en el OS — vía motores + Agent Runtime.

**Recorte Bloque 4:** solo fronteras / contratos (JARVIS como caller de motores). **Sin** Agent Runtime ni runtimes de motores.

**Bloque 5:** Agent Runtime (+ service modules).

---

## 5. WhatsApp / email / voz

Canales futuros de **captación u ops** se integran como:

- conectores en Tool Registry (OS), y/o  
- formularios/webhooks hacia Lead,

nunca como exposición de agentes al cliente final.
