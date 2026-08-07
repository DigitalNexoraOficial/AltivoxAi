/**
 * Bloque 1 security self-tests.
 * Run: npx --yes tsx src/core/security/security.selftest.ts
 */
import { can, n8nIntegrationSubject } from "./permission-manager";
import type { HumanSubject, MachineSubject } from "./permission-manager";
import { ROLE_PERMISSIONS, permissionsForHumanRole } from "./roles";
import { isOpsProtectedPath } from "./session";
import { rateLimit } from "./rate-limit";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const viewer: HumanSubject = { type: "human", id: "u1", role: "viewer" };
  const editor: HumanSubject = { type: "human", id: "u3", role: "editor" };
  const operator: HumanSubject = { type: "human", id: "u4", role: "operator" };
  const admin: HumanSubject = { type: "human", id: "u2", role: "admin" };
  const superadmin: HumanSubject = {
    type: "human",
    id: "u0",
    role: "superadmin",
  };
  const jarvis: MachineSubject = {
    type: "machine",
    id: "jarvis:1",
    principalType: "jarvis",
  };
  const agent: MachineSubject = {
    type: "machine",
    id: "agent:seo",
    principalType: "agent",
    allowlist: ["tool.execute", "project.read"],
  };
  const n8n = n8nIntegrationSubject();

  assert(!can(null, "lead.read").allowed, "deny-by-default: missing subject");
  assert(!can(viewer, "not.a.real.action").allowed, "deny unknown action");
  assert(can(viewer, "lead.read").allowed, "viewer lead.read");
  assert(!can(viewer, "lead.delete").allowed, "viewer deny lead.delete");
  assert(!can(viewer, "settings.write").allowed, "viewer deny settings.write");
  assert(can(editor, "settings.write").allowed, "editor settings.write");
  assert(!can(editor, "n8n.write_crm").allowed, "editor deny n8n.write_crm");
  assert(can(operator, "n8n.write_crm").allowed, "operator n8n.write_crm");
  assert(!can(operator, "settings.write").allowed, "operator deny settings.write");
  assert(can(admin, "settings.write").allowed, "admin settings.write");
  assert(!can(admin, "role.manage").allowed, "admin deny role.manage");
  assert(can(superadmin, "role.manage").allowed, "superadmin role.manage");
  assert(
    ROLE_PERMISSIONS.admin.includes("settings.write") &&
      !ROLE_PERMISSIONS.viewer.includes("settings.write"),
    "explicit bags"
  );
  assert(can(jarvis, "project.create").allowed, "jarvis project.create");
  assert(
    !can(jarvis, "deploy.production").allowed,
    "jarvis deny deploy.production"
  );
  assert(!can(jarvis, "role.manage").allowed, "jarvis is not superadmin");
  assert(can(agent, "tool.execute").allowed, "agent allowlist tool.execute");
  assert(!can(agent, "deploy.preview").allowed, "agent deny outside allowlist");
  assert(
    !can(
      {
        type: "machine",
        id: "a",
        principalType: "agent",
        allowlist: ["role.manage"],
      },
      "role.manage"
    ).allowed,
    "agent cannot escalate via allowlist beyond ceiling"
  );
  assert(can(n8n, "n8n.emit").allowed, "n8n emit");
  assert(can(n8n, "n8n.write_crm").allowed, "n8n write_crm");
  assert(!can(n8n, "settings.write").allowed, "n8n deny settings.write");
  assert(!can(n8n, "role.manage").allowed, "n8n deny role.manage");
  assert(
    can(admin, "client.update", { type: "cliente", id: "x" }).allowed,
    "resource-shaped call"
  );
  assert(permissionsForHumanRole("viewer").has("ops.access"), "viewer ops.access");

  assert(isOpsProtectedPath("/dashboard.html"), "protect dashboard");
  assert(isOpsProtectedPath("/ops"), "protect /ops");
  assert(isOpsProtectedPath("/ops/projects"), "protect /ops/*");
  assert(isOpsProtectedPath("/api/ops/site-settings"), "protect ops api");
  assert(
    !isOpsProtectedPath("/api/ops/session"),
    "session endpoint not gated as ops api"
  );
  assert(!isOpsProtectedPath("/"), "public home");
  assert(!isOpsProtectedPath("/api/lead"), "public lead api");
  assert(!isOpsProtectedPath("/login.html"), "login public");

  process.env.RATE_LIMIT_MODE = "memory";
  const id = "selftest-" + Date.now();
  let hitDeny = false;
  for (let i = 0; i < 15; i++) {
    const r = await rateLimit("chat", id);
    if (!r.success) {
      hitDeny = true;
      break;
    }
  }
  assert(hitDeny, "rate limit eventually denies in memory mode");

  console.log("security.selftest: ok");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
