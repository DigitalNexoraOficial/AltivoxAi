/**
 * Service module: web (Bloque 5 · ADR-015).
 * Declares capabilities only — does not write to Project Engine.
 */

import type { ServiceModuleManifest } from "@/modules/registry";

export const webModule: ServiceModuleManifest = {
  id: "web",
  serviceType: "web",
  description: "Desarrollo web — primer service module",
  capabilities: ["web.frontend", "web.qa"],
};
