/**
 * Lightweight permission-manager smoke checks (node --import tsx or next build covers types).
 * Run: npx --yes tsx src/core/security/permission-manager.selftest.ts
 */
import { can } from "./permission-manager";
import type { HumanSubject, MachineSubject } from "./permission-manager";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const viewer: HumanSubject = { type: "human", id: "u1", role: "viewer" };
const admin: HumanSubject = { type: "human", id: "u2", role: "admin" };
const jarvis: MachineSubject = {
  type: "machine",
  id: "jarvis:1",
  principalType: "jarvis",
};

assert(!can(null, "lead.read").allowed, "deny missing subject");
assert(can(viewer, "lead.read").allowed, "viewer can read leads");
assert(!can(viewer, "lead.delete").allowed, "viewer cannot delete leads");
assert(!can(viewer, "settings.write").allowed, "viewer cannot write settings");
assert(can(admin, "settings.write").allowed, "admin can write settings");
assert(!can(admin, "role.manage").allowed, "admin cannot role.manage");
assert(can(jarvis, "project.create").allowed, "jarvis can project.create");
assert(!can(jarvis, "deploy.production").allowed, "jarvis cannot deploy.production");
assert(!can(jarvis, "role.manage").allowed, "jarvis is not superadmin");
assert(!can(viewer, "not.a.real.action").allowed, "unknown action denied");

// resource accepted without changing allow (Bloque 1)
assert(
  can(admin, "client.update", { type: "cliente", id: "x" }).allowed,
  "resource-shaped call works"
);

console.log("permission-manager.selftest: ok");
