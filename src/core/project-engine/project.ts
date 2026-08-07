/**
 * Domain helpers for Project (pure).
 */

import type { CreateProjectInput, UpdateProjectMetaInput } from "./types";
import { ProjectEngineError } from "./types";

export function normalizeCreateInput(
  raw: Partial<CreateProjectInput>
): CreateProjectInput {
  const name = String(raw.name || "").trim();
  const serviceType = String(raw.serviceType || "").trim();
  if (!name) {
    throw new ProjectEngineError("invalid_input", "name_required");
  }
  if (!serviceType) {
    throw new ProjectEngineError("invalid_input", "service_type_required");
  }
  if (name.length > 200) {
    throw new ProjectEngineError("invalid_input", "name_too_long");
  }
  if (serviceType.length > 100) {
    throw new ProjectEngineError("invalid_input", "service_type_too_long");
  }
  return {
    name,
    serviceType,
    clientId: raw.clientId === undefined ? null : raw.clientId || null,
    leadId: raw.leadId === undefined ? null : raw.leadId || null,
    description: String(raw.description || "").slice(0, 4000),
    metadata:
      raw.metadata && typeof raw.metadata === "object" && !Array.isArray(raw.metadata)
        ? raw.metadata
        : {},
  };
}

export function normalizeMetaPatch(
  raw: Partial<UpdateProjectMetaInput>
): UpdateProjectMetaInput {
  const out: UpdateProjectMetaInput = {};
  if (raw.name !== undefined) {
    const name = String(raw.name).trim();
    if (!name) throw new ProjectEngineError("invalid_input", "name_required");
    if (name.length > 200) {
      throw new ProjectEngineError("invalid_input", "name_too_long");
    }
    out.name = name;
  }
  if (raw.serviceType !== undefined) {
    const serviceType = String(raw.serviceType).trim();
    if (!serviceType) {
      throw new ProjectEngineError("invalid_input", "service_type_required");
    }
    if (serviceType.length > 100) {
      throw new ProjectEngineError("invalid_input", "service_type_too_long");
    }
    out.serviceType = serviceType;
  }
  if (raw.clientId !== undefined) out.clientId = raw.clientId || null;
  if (raw.leadId !== undefined) out.leadId = raw.leadId || null;
  if (raw.description !== undefined) {
    out.description = String(raw.description).slice(0, 4000);
  }
  if (raw.metadata !== undefined) {
    if (
      !raw.metadata ||
      typeof raw.metadata !== "object" ||
      Array.isArray(raw.metadata)
    ) {
      throw new ProjectEngineError("invalid_input", "metadata_must_be_object");
    }
    out.metadata = raw.metadata;
  }
  if (Object.keys(out).length === 0) {
    throw new ProjectEngineError("invalid_input", "empty_patch");
  }
  return out;
}
