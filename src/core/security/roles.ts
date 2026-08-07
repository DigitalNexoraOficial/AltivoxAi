/**
 * Human roles and machine principal types.
 * Roles are permission bags — NO inheritance between roles.
 */

import type { Action } from "./permissions";

export const HUMAN_ROLES = [
  "superadmin",
  "admin",
  "editor",
  "operator",
  "viewer",
] as const;

export type HumanRole = (typeof HUMAN_ROLES)[number];

export const MACHINE_PRINCIPAL_TYPES = [
  "jarvis",
  "agent",
  "workflow",
  "service",
  "integration",
] as const;

export type MachinePrincipalType = (typeof MACHINE_PRINCIPAL_TYPES)[number];

export const STAFF_ROLES: readonly HumanRole[] = [
  "superadmin",
  "admin",
  "editor",
  "operator",
  "viewer",
];

/** Roles allowed to open admin HTML /ops (UX + middleware). */
export const OPS_ACCESS_ROLES: readonly HumanRole[] = STAFF_ROLES;

export function isHumanRole(value: unknown): value is HumanRole {
  return (
    typeof value === "string" &&
    (HUMAN_ROLES as readonly string[]).includes(value)
  );
}

/**
 * Effective permissions per human role.
 * No role inherits from another — each list is explicit.
 */
export const ROLE_PERMISSIONS: Record<HumanRole, readonly Action[]> = {
  superadmin: [
    "lead.read",
    "lead.update",
    "lead.delete",
    "client.read",
    "client.create",
    "client.update",
    "client.delete",
    "settings.read",
    "settings.write",
    "n8n.emit",
    "n8n.write_crm",
    "audit.read",
    "ops.access",
    "project.create",
    "project.read",
    "project.update",
    "project.delete",
    "project.approve",
    "project.transition",
    "agent.execute",
    "agent.stop",
    "agent.configure",
    "workflow.execute",
    "workflow.configure",
    "capability.assign",
    "tool.execute",
    "tool.configure",
    "deliverable.generate",
    "review.create",
    "review.revoke",
    "deploy.preview",
    "deploy.production",
    "credentials.read",
    "credentials.use",
    "credentials.manage",
    "user.manage",
    "role.manage",
    "approval.decide",
  ],
  admin: [
    "lead.read",
    "lead.update",
    "lead.delete",
    "client.read",
    "client.create",
    "client.update",
    "client.delete",
    "settings.read",
    "settings.write",
    "n8n.emit",
    "n8n.write_crm",
    "audit.read",
    "ops.access",
    "project.create",
    "project.read",
    "project.update",
    "project.delete",
    "project.approve",
    "project.transition",
    "agent.execute",
    "agent.stop",
    "agent.configure",
    "workflow.execute",
    "workflow.configure",
    "capability.assign",
    "tool.execute",
    "tool.configure",
    "deliverable.generate",
    "review.create",
    "review.revoke",
    "deploy.preview",
    "deploy.production",
    "credentials.read",
    "credentials.use",
    "credentials.manage",
    "approval.decide",
  ],
  editor: [
    "lead.read",
    "lead.update",
    "client.read",
    "client.update",
    "settings.read",
    "settings.write",
    "audit.read",
    "ops.access",
    "project.read",
    "project.update",
  ],
  operator: [
    "lead.read",
    "lead.update",
    "client.read",
    "client.create",
    "client.update",
    "settings.read",
    "n8n.emit",
    "n8n.write_crm",
    "audit.read",
    "ops.access",
    "project.read",
    "project.update",
    "project.transition",
    "agent.execute",
    "agent.stop",
    "workflow.execute",
    "tool.execute",
    "deliverable.generate",
    "review.create",
    "deploy.preview",
    "credentials.use",
  ],
  viewer: [
    "lead.read",
    "client.read",
    "settings.read",
    "audit.read",
    "ops.access",
    "project.read",
  ],
};

/**
 * Machine principal permission ceilings (documented + enforced when subject is machine).
 * JARVIS is NOT superadmin.
 */
export const MACHINE_PERMISSION_CEILINGS: Record<
  MachinePrincipalType,
  readonly Action[]
> = {
  jarvis: [
    "lead.read",
    "lead.update",
    "client.read",
    "client.create",
    "client.update",
    "settings.read",
    "n8n.emit",
    "audit.read",
    "ops.access",
    "project.create",
    "project.read",
    "project.update",
    "project.transition",
    "capability.assign",
    "agent.execute",
    "agent.stop",
    "workflow.execute",
    "tool.execute",
    "deliverable.generate",
    "review.create",
    "deploy.preview",
    "credentials.use",
  ],
  agent: [
    "project.read",
    "tool.execute",
    "credentials.use",
    "deliverable.generate",
  ],
  workflow: [
    "project.read",
    "project.transition",
    "agent.execute",
    "workflow.execute",
    "tool.execute",
  ],
  service: [
    "lead.read",
    "lead.update",
    "client.read",
    "client.create",
    "client.update",
    "n8n.emit",
    "n8n.write_crm",
    "settings.read",
  ],
  integration: ["n8n.emit", "n8n.write_crm", "lead.read", "lead.update", "client.read", "client.create", "client.update"],
};

export function permissionsForHumanRole(role: HumanRole): ReadonlySet<Action> {
  return new Set(ROLE_PERMISSIONS[role]);
}

export function permissionsForMachine(
  type: MachinePrincipalType
): ReadonlySet<Action> {
  return new Set(MACHINE_PERMISSION_CEILINGS[type]);
}
