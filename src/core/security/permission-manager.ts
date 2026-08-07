/**
 * Permission Manager — can(subject, action, resource)
 * Default: DENY. Roles do not inherit; only explicit permission bags apply.
 */

import { isAction, type Action } from "./permissions";
import {
  isHumanRole,
  permissionsForHumanRole,
  permissionsForMachine,
  type HumanRole,
  type MachinePrincipalType,
} from "./roles";

export type ResourceRef = {
  type: string;
  id?: string;
  clientId?: string;
  projectId?: string;
  meta?: Record<string, unknown>;
};

export type HumanSubject = {
  type: "human";
  id: string;
  role: HumanRole;
  email?: string;
};

export type MachineSubject = {
  type: "machine";
  id: string;
  principalType: MachinePrincipalType;
  /** Optional extra allowlist (e.g. agent tool scope) — intersected with ceiling */
  allowlist?: readonly Action[];
};

export type Subject = HumanSubject | MachineSubject;

export type CanResult = {
  allowed: boolean;
  reason: string;
  action: Action | string;
};

function effectiveActions(subject: Subject): ReadonlySet<Action> {
  if (subject.type === "human") {
    return permissionsForHumanRole(subject.role);
  }
  const ceiling = permissionsForMachine(subject.principalType);
  if (!subject.allowlist || subject.allowlist.length === 0) return ceiling;
  const out = new Set<Action>();
  for (const a of subject.allowlist) {
    if (ceiling.has(a)) out.add(a);
  }
  return out;
}

/**
 * Authorize an action on an optional resource.
 * Resource is accepted now for future project/client-scoped rules;
 * Bloque 1 only checks action membership in the subject's effective set.
 */
export function can(
  subject: Subject | null | undefined,
  action: string,
  _resource?: ResourceRef | null
): CanResult {
  if (!subject) {
    return { allowed: false, reason: "missing_subject", action };
  }
  if (!isAction(action)) {
    return { allowed: false, reason: "unknown_action", action };
  }
  if (subject.type === "human" && !isHumanRole(subject.role)) {
    return { allowed: false, reason: "invalid_role", action };
  }

  const allowedSet = effectiveActions(subject);
  if (!allowedSet.has(action)) {
    return { allowed: false, reason: "permission_denied", action };
  }

  // Future: resource-scoped rules (same clientId/projectId, ownership, etc.)
  return { allowed: true, reason: "allow", action };
}

export function assertCan(
  subject: Subject | null | undefined,
  action: string,
  resource?: ResourceRef | null
): void {
  const result = can(subject, action, resource);
  if (!result.allowed) {
    const err = new Error(`Forbidden: ${result.reason}`) as Error & {
      status?: number;
      code?: string;
    };
    err.status = 403;
    err.code = result.reason;
    throw err;
  }
}

/** Map n8n shared secret caller → machine integration principal */
export function n8nIntegrationSubject(): MachineSubject {
  return {
    type: "machine",
    id: "integration:n8n",
    principalType: "integration",
  };
}

export function humanSubjectFromClaims(input: {
  id: string;
  role?: unknown;
  email?: string;
}): HumanSubject | null {
  if (!isHumanRole(input.role)) return null;
  return {
    type: "human",
    id: input.id,
    role: input.role,
    email: input.email,
  };
}
