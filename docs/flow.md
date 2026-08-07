# Mapa de flujo — Altivox AI

Cómo funciona la web de extremo a extremo: del visitante al seguimiento CRM.

---

## 1. Embudo principal

```
Usuario
  │
  ▼
Landing (/)  ─── industria, prueba social, servicios, ofertas
  │
  ├──► Servicios (#services)
  ├──► Calculadoras (#calculator, AiAudit)
  ├──► Simuladores (#simulator, NeedsQuiz, PackageComparator)
  ├──► Insights / “Blog light” (#insights)  [sin /blog aún]
  ├──► Casos (/casos/[slug])
  │
  ▼
Contacto / Booking / WhatsApp / Chat
  │
  ▼
Conversión  ── POST /api/lead  (o interés vía /api/chat)
  │
  ▼
CRM  ── tabla leads → (opcional) clientes
  │
  ▼
Seguimiento  ── dashboard admin · n8n notify · WA/email humano
```

---

## 2. Journey detallado (landing)

| Paso | Superficie | Componente / ruta | Acción |
|------|------------|-------------------|--------|
| 1 | Entrada | `page.tsx` + `Navbar` | Orientación + skip link |
| 2 | Valor | `Hero` | CTA ofertas / booking |
| 3 | Confianza | `SocialProofBar`, `CaseStudies`, `Testimonials` | Prueba social |
| 4 | Contexto | `IndustryPicker` | Personaliza copy/hooks |
| 5 | Oferta | `Services`, `Offers`, `GrowthSuite` | Paquetes y herramientas |
| 6 | Educar | `Calculator`, `Simulator`, `LeadMagnet` | Engagement + lead |
| 7 | Cerrar | `FinalCTA`, `Contact`, `StickyCTA`, `WhatsAppCTA`, `ChatWidget` | Conversión |
| 8 | Post-lead | `/bienvenida` | Onboarding ligero |
| 9 | Ops | `dashboard.html` / `clientes.html` | Seguimiento humano |

Feature flags (`site_settings.flags`) pueden apagar chat, booking, lead magnet o sticky CTA.

---

## 3. Flujos de conversión

### 3.1 Formulario de contacto

```
Contact.tsx → POST /api/lead { fuente: contact|... }
  → Supabase leads (service role preferido)
  → n8n webhook lead.created | lead.hot
  → (UX) thank / bienvenida
```

### 3.2 Lead magnet (guía PDF)

```
LeadMagnet.tsx → POST /api/lead { fuente: guia|lead_magnet }
  → download PDF public/assets/guia/...
```

### 3.3 Calculadora / auditoría / booking

```
Calculator | AiAudit | BookingModal → POST /api/lead
  → score server-side por fuente
  → notify n8n si hot
```

### 3.4 WhatsApp

```
WhatsAppCTA / Contact wa.me
  → número desde site_settings.contact.whatsapp
    (fallback NEXT_PUBLIC_WHATSAPP_NUMBER / default código)
  → conversación humana (fuera de CRM automático hoy)
```

### 3.5 Chat

```
ChatWidget → POST /api/chat { message, agent }
  → OpenRouter → Gemini fallback
  → respuesta UI
  [hueco] no crea lead automático de forma robusta aún
```

---

## 4. Flujo CRM / admin

```
login.html (Supabase Auth)
  → dashboard.html  (leads: filtrar, CSV, WA, convertir)
  → clientes.html   (CRUD clientes)
  → chatbot.html    (monitor chat/health)
  → jarvis.html     (reanalysis / health UI)
  → agentes.html    (catálogo cosmético localStorage)
  → ajustes.html    (site_settings + n8n ping)
```

Conversión lead → cliente: acción en dashboard que escribe `clientes` (+ opcional `/api/n8n` create_cliente).

---

## 5. Conexiones entre componentes

```
                    ┌─ SiteSettingsProvider ← GET /api/site-settings
layout.tsx providers┤─ I18nProvider ← i18n.ts
                    ├─ IndustryProvider ← afecta Hero/WA/SocialProof
                    └─ SmoothScrollProvider ← Lenis + GSAP reveals

page.tsx
  ├─ ScrollAIBackground → ScrollAIScene (R3F)
  ├─ sections.* (Reveal / motion)
  ├─ GrowthSuite → AiAudit, NeedsQuiz, PackageComparator, CrmDemo, Showreel, Guarantee
  ├─ StickyCTA ← flags + section dataset (ScrollStorytelling)
  ├─ ChatWidget ← flags.chatEnabled
  └─ DeferredExtras → BrandLoader, Cursor, Sound, ScrollTop, WhatsAppCTA

APIs
  lead ──► Supabase leads ──► N8N_WEBHOOK_URL
  n8n  ◄── admin / n8n cloud (JWT o secret)
  chat ──► LLM providers
```

---

## 6. Eventos de automatización

| Evento | Origen típico | Consumidor |
|--------|---------------|------------|
| `lead.created` | `/api/lead` | n8n 01 |
| `lead.hot` | `/api/lead` (score) | n8n 01 rama hot |
| `lead.updated` / `lead.contacted` | admin / n8n ops | CRM humano |
| `cliente.created` / updates | `/api/n8n`, admin | onboarding 02 |
| `jarvis.rescored` | jarvis UI (diseño) | ops |
| `system.ping` | ajustes | health |

Detalle de payloads: [`api.md`](./api.md).

---

## 7. Mapa de rutas públicas

| Ruta | Indexable | Rol |
|------|-----------|-----|
| `/` | Sí | Landing |
| `/casos/[slug]` | Sí | Caso |
| `/bienvenida` | No (ideal) | Post-conversión |
| `/portal` | No (`robots`) | Demo portal cliente |
| `/design-system` | No | Interno |
| `/login.html` … admin | No | Operación |

---

## 8. Huecos del mapa (producto)

1. No hay ruta `/blog` — Insights es sección, no embudo de contenido.
2. Chat no está plenamente cableado al CRM.
3. Portal y CrmDemo no leen datos reales.
4. Seguimiento post-venta (tickets/SLA) no existe como entidad.
5. Analítica de funnel incompleta (A/B local, sin warehouse).
