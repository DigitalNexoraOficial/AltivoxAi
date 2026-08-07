/**
 * Service module registry (Bloque 5 · ADR-015).
 * Modules are data manifests — not PE writers.
 */

import { webModule } from "@/modules/web/manifest";

const MODULES = [webModule] as const;

export type ServiceModuleManifest = {
  id: string;
  serviceType: string;
  capabilities: string[];
  description?: string;
};

export function knownModuleIds(): string[] {
  return MODULES.map((m) => m.id);
}

export function getModule(id: string): ServiceModuleManifest | null {
  return MODULES.find((m) => m.id === id) ?? null;
}

export function listModules(): ServiceModuleManifest[] {
  return [...MODULES];
}
