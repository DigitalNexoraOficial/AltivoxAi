# ADR-017 — Bloque 7: Deploy Engine + entrega ZIP (recorte)

- **Estado:** Aceptado · **contrato documental** (Prebloque B7-A)  
- **Fecha:** 2026-08-07  
- **Decisores:** Owner (Xabier) · arquitectura Altivox OS  
- **Analogía:** mismo tipo de corte que [`ADR-013`](./ADR-013-project-engine.md) … [`ADR-016`](./ADR-016-bloque-6-review-engine.md)

---

# Contexto

Los bloques **0–6** están cerrados:

| Bloque | Contenido | Contrato |
|--------|-----------|----------|
| 0–1 | Docs + Seguridad | ADR-010 · ADR-011 · ADR-012 |
| 2 | Project Engine (recorte) | ADR-013 |
| 3 | Shell `/ops` | Roadmap Fase 3 |
| 4 | JARVIS Core caller + fronteras TypeScript de motores | ADR-014 |
| 5 | Agent Runtime + Agent Manager + módulo `web` + Tool/Memory/Capability mínimos | ADR-015 |
| 6 | Review Engine + portal `/r/[token]` | ADR-016 |

**Existe hoy:** PE (proyectos, versiones, deliverables, timeline, estados de fase) · Security (`can()`, RLS, audit; acciones `deploy.preview` / `deploy.production` ya en catálogo) · Agent Runtime **interno** · Review Engine (sesiones, tokens, comentarios, aprobación/rechazo, snapshot de deliverables).

**No existe:** Deploy Engine · ZIP pipeline · `/api/deploy/*` · tablas `deployments` · providers externos · publicación automática · gestión de dominio/hosting como producto.

El roadmap declara a continuación:

- **7.** Entrega ZIP + Deployment Engine  

Sin un ADR de recorte, B7 tiende a absorber Workflow runtime, CRM, reabrir PE/Review/Agent Runtime, publicar sin confirmación humana, o convertir agentes en “deployers” autónomos.

Este ADR es el **Prebloque B7-A**: sincronización documental. **No** implementa el Bloque 7.

> Nota: el brief de entrada se truncó en «Estados posibles:». Los estados de deployment de este ADR son la **propuesta arquitectónica oficial** del Prebloque; cualquier enmienda posterior requiere ADR o addendum explícito antes de código.

---

# Problema

1. Confundir **entrega/publicación técnica** con dominio PE o con aprobación Review.  
2. Mezclar Deploy con **Agent Runtime** (runs, prompts, Memory) o con el portal `/r`.  
3. Publicar a vendors **sin** confirmación humana (riesgo de producción accidental).  
4. Ampliar Tool Registry a “todo vendor” sin recorte, o reabrir PE/Review/Security.  
5. Diseñar clases, tablas, rutas o adapters antes de congelar el alcance.

---

# Decisión — Qué es Deploy Engine

**Deploy Engine es un motor independiente**, no una extensión de PE ni de Review.

| Motor | Dueño de |
|-------|----------|
| **Project Engine** | Proyecto, versiones, deliverables, estados de fase |
| **Review Engine** | Sesión cliente, tokens, feedback, aprobación/rechazo |
| **Deploy Engine** | Empaquetado, solicitud de despliegue, publicación técnica, historial de deployments |

Motivo: separar dominio de negocio (PE), consentimiento cliente (Review) y publicación técnica (Deploy).

---

# Decisión — Qué incluye B7

1. **Deploy Engine independiente** — ciclo de vida de un **deployment** (solicitud → paquete → confirmación → publicación / fallo).  
2. **Validación de artefacto aprobado** — solo consumir deliverables / sesiones Review en estado **approved** (o política Ops equivalente explícita); **nunca** publicar desde `rejected` / `revoked` / sin allowlist.  
3. **Deployment request** — registro de intención de entrega ligada a `projectId`, `versionId`, refs de deliverables/paquete.  
4. **ZIP / build package pipeline** — generación de artefacto de entrega (código/docs/guía/`.env.example`/README según tipo de servicio); almacenamiento de ref del paquete.  
5. **Estados propios de deployment** (≠ `projects.status`, ≠ estados Review):

```
draft → queued → packaging → package_ready
  → awaiting_confirmation → publishing → published
                 ↘ failed
cualquier no-terminal → cancelled
```

| Estado | Significado |
|--------|-------------|
| `draft` | Solicitud creada; aún no encolada |
| `queued` | Lista para empaquetar |
| `packaging` | Generando ZIP/paquete |
| `package_ready` | Paquete disponible (entrega descargable / ref) |
| `awaiting_confirmation` | Esperando **confirmación humana** antes de publish a destino |
| `publishing` | Adapter de vendor en curso |
| `published` | Publicación registrada como OK |
| `failed` | Error controlado (reintentable según política; no auto-promueve PE) |
| `cancelled` | Abortado por Ops/JARVIS |

6. **Historial y errores** — persistencia propia (`deployments`, eventos/errores de deploy); timeline Deploy separado de `project_events` y `review_events`.  
7. **Adapters de publicación vía Tool Registry (ampliado)** — destinos opcionales (p. ej. GitHub, Vercel, WordPress, FTP u otros plugins); **no** el mínimo LLM de B5. Cada destino = adapter; añadir destino no reescribe el core.  
8. **Confirmación humana obligatoria** antes de `deploy.production` (y, por defecto, antes de cualquier publish a destino cliente). Preview puede usar `deploy.preview` con el mismo techo `can()`.  
9. **APIs Ops de deploy** — familia `/api/ops/deployments*` (o `/api/ops/deploy*`); **no** superficie pública ni portal `/r`.  
10. **Emisión / cancelación / confirmación desde Ops** — `can(deploy.preview)` / `can(deploy.production)` (nombres ya en catálogo B1).  
11. **JARVIS** puede **solicitar** create/queue/cancel/confirm de deploy **mediante caller** a use-cases del Deploy Engine; **no** publica por sí mismo ni bypassa confirmación.  
12. **Integración PE** solo vía **use-cases públicos** (lectura proyecto/versión/deliverables; transición a `delivered` **solo** si Ops/JARVIS llama explícitamente un use-case PE ya existente — **sin** auto-transición obligatoria desde Deploy).  
13. **Integración Review** — leer estado/aprobación / snapshot allowlist vía superficie pública del Review Engine; **sin** SQL Review interno ni tokens en Deploy.  
14. Este ADR **no diseña** clases, schemas SQL definitivos, firmas TypeScript, contratos de adapters ni rutas HTTP concretas más allá del recorte. Congela alcance. Persistencia/APIs/UI/adapters se definirán en el bloque de código bajo este corte.

---

# Decisión — Qué excluye B7

Bloque 7 **excluye explícitamente**:

- Reabrir o reescribir **PE**, **Review**, **Security**, **Ops shell** o **Agent Runtime** (salvo bug real)  
- Convertir **Agent Runtime** en Deploy Engine o exponer agentes/prompts/runs/Memory al flujo de publish  
- **Publicación automática** a producción sin confirmación humana  
- Portal cliente `/r` como superficie de deploy  
- **Chat público** / CRM / migración HTML → App Router  
- **Workflow runtime** completo (sigue diferido)  
- **Marketplace** de adapters o agentes  
- Gestión avanzada de **DNS / dominios / facturación de hosting** como producto (solo adapters de publish puntuales)  
- Multi-cloud orchestration genérica / IaC completo (Terraform-as-product)  
- Sustituir confirmación humana por “agente deployer” autónomo  
- Stubs que fingan publish real sin Deploy Engine  
- Plataforma pública de agentes (ADR-010)

---

# Fronteras arquitectónicas

| Pieza | Rol en B7 |
|-------|-----------|
| **Project Engine** | Dueño del proyecto / versiones / deliverables / fase (`delivered`, etc.) |
| **Review Engine** | Dueño de la aprobación cliente; Deploy **consume** approved |
| **Deploy Engine** | Dueño del empaquetado y la publicación técnica |
| **Tool Registry** | Único camino de I/O a vendors de publish (ampliado en B7) |
| **Agent Runtime** | Permanece **interno**; no es el pipeline de deploy |
| **JARVIS Core** | Caller/orquestador; no es el adapter ni el botón “publicar sin can()” |
| **Security** | `can(deploy.preview\|deploy.production)`; sin bypass |
| **`/r/[token]`** | Sigue siendo Review; **cero** deploy |

Cadena Ops:

`caller (humano OPS o JARVIS) → Subject → can(deploy.*) → Deploy Engine → (PE/Review use-cases públicos) → Tool Registry adapters (tras confirmación humana)`

Regla dura:

**Aprobación Review ≠ publicación.**  
**Paquete ZIP ≠ publish a vendor.**  
**Publish requiere confirmación humana + `can()`.**

---

# Seguridad

1. **Ops** — mutaciones solo con `can(subject, "deploy.preview" | "deploy.production", resource)` (techos B1; sin bypass).  
2. **Confirmación humana** — paso explícito antes de publish a destino cliente / producción.  
3. **Sin `service_role` en frontend** — mutaciones server-side tras authz.  
4. **Sin sesión cliente** en APIs de deploy — solo Ops (y caller JARVIS interno).  
5. Credenciales de vendors — solo vía mecanismo de credentials ya previsto en Security (sin exponer al portal ni a la web pública).  
6. Prompts, agent IDs, Memory de runs y tools internas **nunca** en respuestas de deploy al cliente.  
7. JARVIS **no** es superadmin (ADR-012); `deploy.production` permanece fuera del techo jarvis salvo decisión futura explícita (hoy: jarvis tiene `deploy.preview` en catálogo; **no** `deploy.production`).  
8. Auditoría técnica en `audit_events`; dominio Deploy en store propio.

---

# Consecuencias

### Qué habilita B7

- Empaquetar y entregar artefactos (ZIP) de forma trazable.  
- Publicar a destinos opcionales vía adapters, con confirmación humana.  
- Historial de deployments desacoplado de PE y Review.  
- Que el OS cierre el ciclo Lead → … → Aprobación → **Entrega/Deploy** → Mantenimiento.

### Qué queda fuera / después

- Workflow runtime pleno · CRM App Router · DNS-as-product · marketplace de adapters · analítica/facturación (fases 8–9).

### Qué no implica ADR-017

- No implica código, tablas, rutas ni adapters concretos.  
- No implica auto-transición PE ni auto-publish.  
- No implica reabrir B0–B6.  
- No es aprobación de implementación: hace falta **OK explícito** de código tras este Prebloque  
  (**«OK implementar Bloque 7»**).

---

# Referencias

- [`ADR-010`](./ADR-010-altivox-os-pivot.md)  
- [`ADR-011`](./ADR-011-core-engines.md)  
- [`ADR-012`](./ADR-012-security-foundation.md)  
- [`ADR-013`](./ADR-013-project-engine.md)  
- [`ADR-014`](./ADR-014-bloque-4-jarvis-motores-interfaces.md)  
- [`ADR-015`](./ADR-015-bloque-5-agent-runtime.md)  
- [`ADR-016`](./ADR-016-bloque-6-review-engine.md)  
- [`../roadmap.md`](../roadmap.md)  
- [`../deployment.md`](../deployment.md)  
- [`../flow.md`](../flow.md)  
- [`../todo.md`](../todo.md)  
- [`../MEMORY.md`](../MEMORY.md)
