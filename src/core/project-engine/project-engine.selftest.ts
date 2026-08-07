/**
 * Bloque 2 Project Engine self-tests (pure + permission wiring).
 * Run: npx --yes tsx src/core/project-engine/project-engine.selftest.ts
 *
 * Does not hit Supabase — repository I/O is out of scope for unit selftest.
 */
import {
  canTransition,
  forwardStatus,
  isProjectStatus,
  PROJECT_STATUSES,
  actionForOp,
  actionForTransition,
  projectResource,
  ProjectEngineError,
} from "./index";
import { normalizeCreateInput, normalizeMetaPatch } from "./project";
import { can, type HumanSubject } from "../security";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function main() {
  assert(PROJECT_STATUSES.length === 10, "exactly 10 statuses");
  assert(isProjectStatus("draft"), "draft valid");
  assert(isProjectStatus("review"), "review is a phase status");
  assert(!isProjectStatus("release_candidate"), "no release_candidate");
  assert(!isProjectStatus("deployment"), "no deployment status");

  assert(canTransition("draft", "planning"), "draft→planning");
  assert(!canTransition("draft", "in_progress"), "no skip ahead");
  assert(canTransition("review", "approved"), "review→approved");
  assert(canTransition("approved", "delivered"), "approved→delivered");
  assert(canTransition("delivered", "maintenance"), "delivered→maintenance");
  assert(!canTransition("maintenance", "delivered"), "no backward");
  assert(canTransition("in_progress", "cancelled"), "cancel from active");
  assert(!canTransition("archived", "cancelled"), "no cancel from archived");
  assert(canTransition("cancelled", "archived"), "cancel→archive");
  assert(canTransition("delivered", "archived"), "delivered→archive");
  assert(canTransition("maintenance", "archived"), "maintenance→archive");
  assert(!canTransition("draft", "archived"), "no archive from draft");
  assert(forwardStatus("qa") === "review", "forward qa");
  assert(forwardStatus("archived") === null, "archived terminal");

  assert(actionForOp("create") === "project.create", "create action");
  assert(actionForOp("read") === "project.read", "read action");
  assert(actionForOp("update_meta") === "project.update", "update action");
  assert(actionForOp("create_version") === "project.update", "version→update");
  assert(
    actionForOp("register_deliverable") === "deliverable.generate",
    "deliverable action"
  );
  assert(
    actionForTransition("approved") === "project.approve",
    "approve needs project.approve"
  );
  assert(
    actionForTransition("qa") === "project.transition",
    "other transitions use project.transition"
  );
  assert(projectResource("p1").type === "project", "resource shape");

  const viewer: HumanSubject = { type: "human", id: "v", role: "viewer" };
  const editor: HumanSubject = { type: "human", id: "e", role: "editor" };
  const operator: HumanSubject = { type: "human", id: "o", role: "operator" };
  const admin: HumanSubject = { type: "human", id: "a", role: "admin" };

  assert(can(viewer, "project.read").allowed, "viewer read");
  assert(!can(viewer, "project.create").allowed, "viewer deny create");
  assert(!can(viewer, "project.transition").allowed, "viewer deny transition");
  assert(can(editor, "project.update").allowed, "editor update");
  assert(!can(editor, "project.transition").allowed, "editor deny transition");
  assert(!can(editor, "project.create").allowed, "editor deny create");
  assert(can(operator, "project.transition").allowed, "operator transition");
  assert(
    !can(operator, "project.approve").allowed,
    "operator deny approve (cannot enter approved alone)"
  );
  assert(can(operator, "deliverable.generate").allowed, "operator deliverable");
  assert(!can(operator, "project.create").allowed, "operator deny create");
  assert(can(admin, "project.create").allowed, "admin create");
  assert(can(admin, "project.approve").allowed, "admin approve");

  const created = normalizeCreateInput({
    name: "  Demo  ",
    serviceType: "web",
  });
  assert(created.name === "Demo", "trim name");
  assert(created.serviceType === "web", "service type");

  let threw = false;
  try {
    normalizeCreateInput({ name: "", serviceType: "x" });
  } catch (e) {
    threw = e instanceof ProjectEngineError;
  }
  assert(threw, "reject empty name");

  const patch = normalizeMetaPatch({ description: "hola" });
  assert(patch.description === "hola", "meta patch");

  threw = false;
  try {
    normalizeMetaPatch({});
  } catch (e) {
    threw = e instanceof ProjectEngineError && e.code === "invalid_input";
  }
  assert(threw, "reject empty patch");

  console.log("project-engine.selftest: ok");
}

main();
