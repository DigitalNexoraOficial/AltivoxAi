# ADR-010 — Pivot a Altivox OS (Sistema Operativo interno)

- **Estado:** Aceptado  
- **Fecha:** 2026-08-07  
- **Decisores:** Owner (Xabier) · CTO/arquitectura (agente Cursor, Bloque 0)

---

## Contexto

La documentación inicial (Fases 1–4) describía una evolución hacia una **plataforma multiagente** con agentes expuestos o activables desde experiencias orientadas al usuario (chat, tools).

El negocio requiere lo contrario: un **Sistema Operativo interno** que gestione toda la empresa, con la web pública limitada a captación y un portal de revisión mínimo para clientes.

## Decisión

1. El producto interno se denomina **Altivox OS**.  
2. Existen **exactamente tres superficies**: web pública, `/ops` (OS), `/r/[token]` (revisión).  
3. Los agentes son **privados**; el cliente nunca los ve ni los invoca.  
4. **JARVIS** es Director de Proyectos / orquestador, **no** chatbot.  
5. El chat público es solo comercial/captación.  
6. El **ciclo de vida de proyecto** documentado en `flow.md` / `product-vision.md` es la referencia oficial.  
7. Extensión **solo por módulos/plugins** e interfaces; el núcleo no se parchea por servicio nuevo.  
8. El roadmap “plataforma pública multiagente” y tareas asociadas quedan **obsoletos**.

## Consecuencias

### Positivas

- Fronteras de seguridad y UX claras (PII interna vs cliente).  
- Escalabilidad por catálogo de servicios sin rewrites del core.  
- Alineación producto–arquitectura–docs.

### Negativas / coste

- Admin HTML actual es temporal hasta `/ops`.  
- Docs y código divergen hasta Bloques 1+.  
- Requiere schema nuevo (proyectos, versiones, tokens, runs) además de leads/clientes.

## Alternativas descartadas

| Alternativa | Motivo de rechazo |
|-------------|-------------------|
| Plataforma pública de agentes | Fuera de modelo de negocio; riesgo de IP/prompts |
| JARVIS como chatbot web | Confunde orquestación con captación |
| Un solo admin HTML eterno | No escala a OS empresarial |
| Portal cliente con vista de agentes | Viola aislamiento |

## Referencias

- [`product-vision.md`](../product-vision.md)  
- [`architecture.md`](../architecture.md)  
- [`flow.md`](../flow.md)  
- [`roadmap.md`](../roadmap.md)  
- [`MEMORY.md`](../MEMORY.md)
