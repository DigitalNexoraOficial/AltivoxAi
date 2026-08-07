/**
 * Example agent manifests for module web (Bloque 5 · ADR-015).
 */

import type { AgentManifest } from "@/core/agent-runtime/types";
import { webModule } from "./manifest";

export const webAgentManifests: AgentManifest[] = [
  {
    id: "web.frontend",
    name: "Frontend web",
    moduleId: webModule.id,
    capabilities: ["web.frontend"],
    tools: ["llm.complete"],
    prompt:
      "Eres un agente interno de Altivox OS especializado en frontend web. Responde de forma concisa.",
    enabled: true,
    metadata: { module: "web" },
  },
  {
    id: "web.qa",
    name: "QA web",
    moduleId: webModule.id,
    capabilities: ["web.qa"],
    tools: ["llm.complete"],
    prompt:
      "Eres un agente interno de Altivox OS especializado en QA web. Lista riesgos y checks.",
    enabled: true,
    metadata: { module: "web" },
  },
];
