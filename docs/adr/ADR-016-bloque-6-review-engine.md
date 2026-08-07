# ADR-016 — Bloque 6: Review Engine + `/r/[token]` (recorte)

- **Estado:** Aceptado e implementado  
- **Fecha:** 2026-08-07 (contrato Prebloque B6-A) · **implementación código:** 2026-08 (Bloque 6 cerrado)  
- **Decisores:** Owner (Xabier) · arquitectura Altivox OS  
- **Analogía:** mismo tipo de corte que [`ADR-013`](./ADR-013-project-engine.md) / [`ADR-014`](./ADR-014-bloque-4-jarvis-motores-interfaces.md) / [`ADR-015`](./ADR-015-bloque-5-agent-runtime.md)
- **Bloque cerrado:** B6 — Review Engine + portal `/r/[token]`

---

# Contexto

Los bloques **0–5** están cerrados:

| Bloque | Contenido | Contrato |
|--------|-----------|----------|
| 0–1 | Docs + Seguridad | ADR-010 · ADR-011 · ADR-012 |
| 2 | Project Engine (recorte) | ADR-013 |
| 3 | Shell `/ops` | Roadmap Fase 3 |
| 4 | JARVIS Core caller + fronteras TypeScript de motores | ADR-014 |
| 5 | Agent Runtime + Agent Manager + módulo `web` + Tool/Memory/Capability mínimos | ADR-015 |

El Project Engine ya tiene el estado de fase `review` en `projects.status`. **Eso no es el portal cliente.**  
`review` = fase operativa del agregado proyecto (OPS marca “en revisión”).  
**Review Engine** + **`/r/[token]`** = superficie **independiente** de feedback/aprobación del cliente (**implementado** en Bloque 6; este ADR fijó el recorte previo).

El roadmap declara a continuación:

- **6.** Review Engine + `/r/[token]`  
- **7.** Entrega ZIP + Deployment Engine  

Sin un ADR de recorte, B6 tiende a absorber Deploy, ZIP, hosting, reabrir PE/Security/Ops, o exponer Agent Runtime (prompts, runs, Memory, Tools) al cliente.

Este ADR es el **Prebloque B6-A**: sincronización documental. **No** implementa el Bloque 6.

---

# Problema

1. Confundir la **fase** `projects.status = review` con el **portal** `/r/[token]` y el Review Engine.  
2. Mezclar Review con **Agent Runtime** (B5): agentes, prompts, runs, Memory/Tools internas visibles o invocables desde el cliente.  
3. Mezclar Review con **Deploy** (B7): ZIP, hosting, vendors de publicación, adapters.  
4. Diseñar clases, tablas, rutas o UI antes de congelar el alcance.  
5. Docs residuales que aún agrupan “B6/B7” o tratan Review como parte de PE/Agent Runtime.

---

# Decisión — Qué incluye B6

1. **Review Engine independiente** — dominio propio de revisión cliente; no es extensión del Agent Runtime ni del Deploy Engine.  
2. **Sesiones de review** ligadas a **proyecto**, **versión** y **deliverables** del Project Engine (referencias; PE sigue siendo dueño del proyecto).  
3. **`review_tokens`** — emisión, validación, revocación y expiración de tokens de acceso al portal.  
4. **Portal cliente `/r/[token]`** — superficie 3 oficial (ADR-010); UI mínima de revisión.  
5. **Acciones de cliente** (alcance producto):  
   - visualizar entregables **permitidos** por la sesión;  
   - comentar;  
   - solicitar cambios;  
   - aprobar;  
   - rechazar.  
6. **APIs review** — familia `/api/review/*` (o equivalente bajo el mismo contrato de superficie Review); auth por token de review, no por sesión staff.  
7. **Emisión / revocación desde Ops** — staff con permisos `review.create` / `review.revoke` (nombres de acción congelados a nivel de contrato; implementación bajo `can()`).  
8. **JARVIS** puede **solicitar** creación/revocación de review **mediante caller** a use-cases del Review Engine (mismo patrón ADR-014/015: orquestador, no dueño del dominio).  
9. **Persistencia propia de Review** — tablas/store del Review Engine (p. ej. tokens, comentarios, decisiones de sesión); **sin** mezclar con `agent_*`, Memory de runs ni `deployments`.  
10. **Integración con PE** únicamente mediante **use-cases públicos existentes** del Project Engine (lectura de proyecto/versión/deliverables; transiciones de estado solo si un use-case PE ya publicado lo permite). **Sin** reabrir ni reescribir el agregado PE (ADR-013 intacto).  
11. Este ADR **no diseña** clases, schemas SQL definitivos, firmas TypeScript ni rutas HTTP concretas más allá del recorte de superficie. Congela alcance. Persistencia/APIs/UI de Review se definirán en el bloque de código bajo este corte — **sin** anticipar Deploy (B7).

---

# Decisión — Qué excluye B6

Bloque 6 **excluye explícitamente**:

- **Deploy Engine**  
- **ZIP pipeline** / empaquetado de entrega  
- **Hosting** de proyectos cliente  
- **Vendors de publicación** (GitHub, Vercel, WordPress, FTP, etc.)  
- **Workflow runtime** (sigue diferido; frontera B4)  
- **CRM** / migración HTML → App Router  
- **Chat público** como canal de review o como JARVIS  
- **Agentes visibles al cliente** (IDs, manifests, estado de runs)  
- **Prompts**, runs, **Memory** interna, **Tools** internas  
- **Marketplace** de agentes o módulos  
- **Reapertura** de PE, Security u Ops (salvo bug real)  
- **Sustituir** al cliente humano por un **agente revisor**  
- Stubs que simulen deploy, ZIP o “review completa” sin Review Engine  
- Plataforma pública de agentes (ADR-010)

---

# Fronteras arquitectónicas

| Pieza | Rol en B6 |
|-------|-----------|
| **Project Engine** | Dueño del **proyecto**, versiones, deliverables y estados de fase (incl. `review` / `approved`). B6 **no** lo sustituye |
| **Review Engine** | Dueño de la **sesión cliente** de revisión (tokens, comentarios, decisiones de portal) |
| **Agent Runtime** | Permanece **interno** al OS (ADR-015). **Cero** exposición en `/r` |
| **JARVIS Core** | Caller/orquestador; puede pedir create/revoke de review; no es el portal ni el Deploy |
| **Security** | Dueño de `can()` para Ops (`review.create` / `review.revoke`); portal autoriza por token |
| **`/r/[token]`** | Superficie cliente **independiente** (no es `/ops` ni web pública de marketing) |
| **Deploy** | Pertenece **exclusivamente a B7** |

Cadena Ops:

`caller (humano OPS o JARVIS) → Subject → can(review.create|review.revoke) → Review Engine → (PE use-cases públicos si hace falta)`

Cadena portal:

`cliente con token → Review Engine valida token (revocable + expiración) → acciones de sesión → deliverables permitidos`

---

# Seguridad

1. **Ops** — emisión y revocación solo con `can(subject, "review.create" | "review.revoke", resource)` (techos B1; sin bypass).  
2. **Portal** — autorización mediante **token seguro** de review; alcance mínimo a la sesión/proyecto/versión/deliverables permitidos.  
3. **Sin sesión staff** en `/r` — no reutilizar cookie/`altivox_ops_token` ni JWT de operador en el portal cliente.  
4. **Sin `service_role` en frontend** — ni en el portal ni en cliente Ops; mutaciones server-side tras authz.  
5. Tokens **revocables** y con **expiración**.  
6. **`/r` fuera de indexación SEO** — `noindex` / disallow (alineado a [`seo.md`](../seo.md)); URLs privadas.  
7. Prompts, agent IDs, tools, Memory de runs y credenciales **nunca** en respuestas del portal.  
8. JARVIS **no** es superadmin (ADR-012); create/revoke pasan por los mismos techos que OPS.

---

# Consecuencias

### Qué habilita B6

- Feedback y aprobación **del cliente** sobre entregables permitidos.  
- Separación clara entre fase PE `review` y sesión/portal Review.  
- Que B7 pueda consumir **únicamente entregables aprobados** (contrato de producto; sin diseñar Deploy aquí).

### Qué queda para B7

- ZIP pipeline · Deployment Engine · hosting · vendors de publicación · confirmación humana de publish.

### Qué no implica ADR-016

- No implica Deploy, ZIP ni hosting.  
- No implica Workflow runtime.  
- No implica agentes revisores ni chat público de review.  
- No implica reabrir PE / Security / Ops / Agent Runtime.  
- El diseño detallado de clases/tablas/rutas se congeló en el Prebloque; **implementación B6 cerrada**.

---

# Referencias

- [`ADR-010`](./ADR-010-altivox-os-pivot.md)  
- [`ADR-011`](./ADR-011-core-engines.md)  
- [`ADR-012`](./ADR-012-security-foundation.md)  
- [`ADR-013`](./ADR-013-project-engine.md)  
- [`ADR-014`](./ADR-014-bloque-4-jarvis-motores-interfaces.md)  
- [`ADR-015`](./ADR-015-bloque-5-agent-runtime.md)  
- [`../roadmap.md`](../roadmap.md)  
- [`../flow.md`](../flow.md)  
- [`../security.md`](../security.md)  
- [`../seo.md`](../seo.md)  
- [`../todo.md`](../todo.md)  
- [`../MEMORY.md`](../MEMORY.md)
