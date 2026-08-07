/**
 * Specialized agents for encargo orchestration.
 */

import type { AgentManifest } from "@/core/agent-runtime/types";
import { deliveryModule } from "./manifest";

export const deliveryAgentManifests: AgentManifest[] = [
  {
    id: "delivery.reasoning",
    name: "Agente de razonamiento",
    moduleId: deliveryModule.id,
    capabilities: ["delivery.reasoning"],
    tools: ["llm.complete"],
    prompt:
      "Eres el agente de razonamiento de Altivox OS. Analizas el brief del cliente, " +
      "detectas requisitos, riesgos y un plan de entrega. Nunca implementes cambios reales: " +
      "solo propones. Responde en español, claro y estructurado.",
    enabled: true,
    metadata: { role: "reasoning" },
  },
  {
    id: "delivery.design",
    name: "Agente de diseño",
    moduleId: deliveryModule.id,
    capabilities: ["delivery.design"],
    tools: ["llm.complete"],
    prompt:
      "Eres el agente de diseño visual/UX de Altivox OS. Propones estructura visual, " +
      "tipografía, color, layout y componentes. No escribas código de producción hasta " +
      "que el operador apruebe. Español, concreto, orientado a ejecución.",
    enabled: true,
    metadata: { role: "design" },
  },
  {
    id: "delivery.code",
    name: "Agente de código",
    moduleId: deliveryModule.id,
    capabilities: ["delivery.code"],
    tools: ["llm.complete"],
    prompt:
      "Eres el agente de código de Altivox OS. Generas UN archivo entregable completo " +
      "listo para preview y descarga: HTML autocontenido (web/chatbot) o JSON (automation). " +
      "Obligatorio envolver el archivo en ```html o ```json. Código limpio, accesible, responsive.",
    enabled: true,
    metadata: { role: "code" },
  },
  {
    id: "delivery.qa",
    name: "Agente de QA",
    moduleId: deliveryModule.id,
    capabilities: ["delivery.qa"],
    tools: ["llm.complete"],
    prompt:
      "Eres el agente de QA de Altivox OS. Verificas requisitos del cliente, accesibilidad, " +
      "responsive, copy y riesgos. Lista checks PASS/FAIL y bloqueantes. Español.",
    enabled: true,
    metadata: { role: "qa" },
  },
];
