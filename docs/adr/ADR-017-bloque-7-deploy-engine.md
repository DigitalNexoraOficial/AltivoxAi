# ADR-017 — Bloque 7: Deploy Engine + entrega ZIP (recorte)

- **Estado:** Aceptado e implementado  
- **Fecha:** 2026-08-07 (contrato Prebloque B7-A) · **implementación código:** 2026-08 (Bloque 7 cerrado)  
- **Decisores:** Owner (Xabier) · arquitectura Altivox OS  
- **Analogía:** mismo tipo de corte que [`ADR-013`](./ADR-013-project-engine.md) … [`ADR-016`](./ADR-016-bloque-6-review-engine.md)
- **Bloque cerrado:** B7 — Deploy Engine + entrega ZIP interna (sin providers externos)

---

# Contexto

Los bloques **0–6** están **cerrados**:

| Bloque | Contenido | Contrato |
|--------|-----------|----------|
| 0–1 | Docs + Seguridad (`can()`, roles, RLS, audit) | ADR-010 · ADR-011 · ADR-012 |
| 2 | Project Engine | ADR-013 |
| 3 | Ops Shell | Roadmap Fase 3 |
| 4 | JARVIS Core caller + fronteras | ADR-014 |
| 5 | Agent Runtime + módulos + Tool/Memory/Capability mínimos | ADR-015 |
| 6 | Review Engine + `/r/[token]` | ADR-016 |

**Existe (tras B7):** PE · Security · Ops · JARVIS · Agent Runtime (interno) · Review Engine · **Deploy Engine + ZIP**.  
**Este ADR** fijó el recorte **antes** del código; la implementación B7 ya está cerrada (ZIP interno; sin providers externos).

Separación oficial de motores:

```
Project Engine  →  proyectos / versiones / deliverables
       ↓
Review Engine   →  validación cliente (approved ≠ deploy)
       ↓
Deploy Engine   →  empaquetado / publicación (B7)
```

Deploy es el bloque de empaquetado/publicación. Este ADR fue el **Prebloque B7-A** (contrato). **Implementación B7:** cerrada — ZIP interno; sin vendors.

---

# Problema

1. Mezclar Deploy con PE, Review o Agent Runtime.  
2. Interpretar “cliente aprueba” como “publicar automáticamente”.  
3. Meter providers (Vercel, FTP, …) en el primer corte y diluir el ZIP/historial.  
4. Dejar que agentes ejecuten deploy o usen credenciales al margen de Security.  
5. Diseñar SQL/APIs/adapters antes de congelar el alcance.

---

# Decisión arquitectónica — Qué es Deploy Engine

**Deploy Engine es un motor independiente.**

No pertenece a:

- Project Engine  
- Review Engine  
- Agent Runtime  
- JARVIS (JARVIS solo **orquesta** vía caller)

### Responsabilidades

- Validar artefactos elegibles (p. ej. deliverables / reviews **approved**).  
- Crear **deployments**.  
- Preparar paquete y **generar ZIP**.  
- Controlar **estados** propios de deployment.  
- Registrar **eventos** e **historial**.  
- Gestionar **errores** de forma controlada.

### No es

- Extensión de PE o de Review.  
- Runtime de agentes.  
- Chatbot / portal cliente.  
- Orquestador (eso es JARVIS).

---

# Alcance B7 inicial — INCLUYE

## 1. Deploy Engine (núcleo)

- Crear deployment.  
- Validar artefactos de entrada.  
- Preparar paquete.  
- Generar ZIP.  
- Controlar ejecución del ciclo de vida.  
- Registrar historial / errores.

### Estados recomendados (propios · ≠ PE · ≠ Review)

```
draft → queued → building → packaged
              → deploying → deployed
                 ↘ failed
cualquier no-terminal → cancelled
```

| Estado | Significado |
|--------|-------------|
| `draft` | Solicitud creada |
| `queued` | En cola |
| `building` | Empaquetando / preparando |
| `packaged` | ZIP/artefacto listo (entrega interna) |
| `deploying` | Ejecución de despliegue interno en curso (sin vendor externo en B7 inicial) |
| `deployed` | Ciclo registrado como completado según política del bloque |
| `failed` | Error controlado |
| `cancelled` | Abortado por Ops / caller autorizado |

## 2. ZIP Pipeline

| Fase | Contenido |
|------|-----------|
| **Entrada** | Deliverables / versiones **aprobados** (vía Review + refs PE) |
| **Proceso** | Recopilar archivos **permitidos** · validar estructura · generar ZIP |
| **Salida** | Artefacto interno preparado (`deployment_artifacts`) |

## 3. Superficie Ops + JARVIS caller

- Operación humana en `/ops` (APIs futuras).  
- JARVIS puede **solicitar** create / execute / cancel vía intenciones → use-cases Deploy.  
- Toda mutación pasa por `can()`.

## 4. Persistencia propia (solo diseño futuro)

Entidades candidatas (sin SQL en B7-A):

- `deployments`  
- `deployment_events`  
- `deployment_artifacts`  
- `deployment_configs`  

Separadas de `projects` · reviews · `agent_runs`.

## 5. APIs futuras (sin crear rutas)

| Familia | Prefijo | Uso |
|---------|---------|-----|
| Ops | `/api/ops/deployments` · `/api/ops/deployments/[id]` | Staff + `can()` |
| Internas | `/api/deploy/*` | Solo si hace falta superficie interna acotada |
| **Prohibido** | `/api/public/deploy` | Nunca público |

---

# Alcance B7 — EXCLUYE

## Review (no reabrir B6)

- Portal `/r/[token]` · tokens · comentarios · aprobaciones como feature de Deploy.

## Agent Runtime (no convertir en deployer)

- Agentes desplegadores · agentes públicos · ejecución autónoma de deploy · exposición de prompts/tools/Memory · credenciales propias del agente para publish.

## Providers externos (B7 inicial)

B7 **inicial sin proveedores externos**.  
Se prepara **arquitectura de adapters** para el futuro, pero **no** se incluyen en este recorte:

- Vercel · Netlify · AWS · GitHub Deploy · FTP · equivalentes.

## Otros

- Workflow Runtime · CRM · chat público · marketplace · multi-tenant avanzado.  
- Reescritura del PE · cambios de base Security (salvo altas mínimas de acciones `deploy.*` en el bloque de código bajo este ADR).  
- Auto-deploy tras aprobación cliente.  
- DNS / hosting-as-product.

---

# Relación con Project Engine

| Puede | No puede |
|-------|----------|
| Leer proyectos / versiones / deliverables | Acceder SQL PE directamente |
| Usar **solo** use-cases públicos PE | Modificar dominio PE |
| | Crear estados de deploy dentro de `projects.status` |

PE sigue siendo dueño del dominio proyecto (ADR-013).

---

# Relación con Review Engine

Review entrega **validación cliente**.  
Deploy **puede requerir** estado **approved**.

**Prohibido:**

`cliente aprueba → deploy automático`

Flujo obligatorio:

```
Deliverable → Review → Approved → (Ops/JARVIS) Deploy Engine → Deployment
```

Deploy no es dueño de tokens ni del portal.

---

# Relación con Agent Runtime

Agentes pueden, en el futuro, **ayudar** en tareas internas (p. ej. preparar metadatos) **dentro** del OS.

**No pueden:**

- Ejecutar Deploy directamente.  
- Saltar Security / `can()`.  
- Usar credenciales al margen del Deploy Engine.  
- Publicar sin pasar por Deploy Engine.

Agent Runtime permanece **interno** (ADR-015).

---

# Seguridad

### Acciones futuras (contrato B7)

- `deploy.create`  
- `deploy.execute`  
- `deploy.cancel`  
- `deploy.configure`  

Toda acción sensible: `can(subject, action, resource)`.

> Nota de catálogo B1: hoy existen `deploy.preview` / `deploy.production` en el catálogo histórico. El contrato **B7** adopta las acciones anteriores. El bloque de código alineará grants/techos **sin** reabrir ADR-012; no hay bypass.

### Reglas

- Sin bypass de `can()`.  
- Sin `service_role` en frontend.  
- Sin credenciales expuestas (portal, pública, logs).  
- Sin ejecución sin auditoría.  

### Sujetos

| Sujeto | Rol |
|--------|-----|
| **Human** | Opera según permisos |
| **JARVIS** | Solo orquesta (caller) |
| **Agent** | **No** ejecuta deployment directo |

---

# Fronteras

| Pieza | Rol |
|-------|-----|
| **PE** | Dominio proyecto |
| **Review** | Aprobación cliente |
| **Deploy** | Empaquetado + ciclo deployment |
| **Tool Registry** | I/O externo futuro (adapters **después** del recorte ZIP) |
| **Agent Runtime** | Interno; no es el pipeline |
| **JARVIS** | Caller |
| **Security** | Autorización |

Cadena:

`caller (OPS o JARVIS) → Subject → can(deploy.*) → Deploy Engine → (PE/Review públicos) → ZIP/artefacto`

---

# Consecuencias

### Habilita (tras OK de código)

- Empaquetado ZIP trazable.  
- Historial de deployments desacoplado.  
- Base para adapters externos en un bloque posterior.

### Estado de implementación (post B7)

- Código, SQL y APIs Deploy Engine **implementados** (Bloque 7 cerrado).  
- Las decisiones de este ADR **permanecen** (motor independiente, estados, sin auto-deploy, sin providers en el recorte inicial).  
- Adapters externos = **posterior** a B7.

---

# Referencias

- [`ADR-010`](./ADR-010-altivox-os-pivot.md) … [`ADR-016`](./ADR-016-bloque-6-review-engine.md)  
- [`../roadmap.md`](../roadmap.md) · [`../core-engines.md`](../core-engines.md) · [`../deployment.md`](../deployment.md) · [`../flow.md`](../flow.md) · [`../MEMORY.md`](../MEMORY.md)
