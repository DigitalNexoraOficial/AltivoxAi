/**
 * Service module: delivery — encargos multi-servicio (web / chatbot / automation).
 * Capabilities only; does not write Project Engine.
 */

import type { ServiceModuleManifest } from "@/modules/registry";

export const deliveryModule: ServiceModuleManifest = {
  id: "delivery",
  serviceType: "delivery",
  description: "Entrega orquestada de encargos con agentes especializados",
  capabilities: [
    "delivery.reasoning",
    "delivery.design",
    "delivery.code",
    "delivery.qa",
  ],
};
