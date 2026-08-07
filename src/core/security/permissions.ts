/**
 * Permission / action catalog for Altivox OS security (Bloque 1).
 * Versioned in TypeScript — no DB overrides yet.
 */

export const ACTIONS = [
  // CRM / captación (runtime hoy)
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

  // Reservados (engines futuros — en catálogo, sin grants activos salvo superadmin doc)
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
] as const;

export type Action = (typeof ACTIONS)[number];

export function isAction(value: string): value is Action {
  return (ACTIONS as readonly string[]).includes(value);
}
