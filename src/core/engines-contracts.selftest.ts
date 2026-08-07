/**
 * Bloque 4/5 engine frontier contracts.
 * Workflow remains interface-only; other engines may have B5 runtime files.
 * Run: npx --yes tsx src/core/engines-contracts.selftest.ts
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { WorkflowEngine } from "@/core/workflow-engine";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function main() {
  type W = WorkflowEngine;
  const _t: W | undefined = undefined;
  void _t;

  const coreRoot = join(dirname(fileURLToPath(import.meta.url)));
  const wfDir = join(coreRoot, "workflow-engine");
  const wfFiles = readdirSync(wfDir);
  assert(
    wfFiles.every((f) => f === "index.ts"),
    `workflow-engine must stay frontier-only, got ${wfFiles.join(",")}`
  );
  const wfSrc = readFileSync(join(wfDir, "index.ts"), "utf8");
  assert(wfSrc.includes("export interface"), "workflow interface");
  assert(!/\bexport\s+(async\s+)?function\b/.test(wfSrc), "workflow no functions");
  assert(!/\bexport\s+class\b/.test(wfSrc), "workflow no class");

  // Runtime modules must not import review/deploy
  for (const name of [
    "agent-runtime",
    "agent-manager",
    "tool-registry",
    "memory-engine",
    "capability-registry",
  ]) {
    const dir = join(coreRoot, name);
    const files = readdirSync(dir, { recursive: true }) as string[];
    for (const f of files) {
      if (!String(f).endsWith(".ts")) continue;
      if (String(f).includes("selftest")) continue;
      const src = readFileSync(join(dir, String(f)), "utf8");
      assert(!src.includes("/r/[token]"), `${name}/${f}: no review portal`);
      assert(
        !src.includes("Deployment Engine") && !src.includes("deploy.production"),
        `${name}/${f}: no deploy runtime`
      );
    }
  }

  // Review Engine must not import agents / tools / memory / deploy
  const reviewDir = join(coreRoot, "review-engine");
  const reviewFiles = readdirSync(reviewDir, { recursive: true }) as string[];
  for (const f of reviewFiles) {
    if (!String(f).endsWith(".ts")) continue;
    if (String(f).includes("selftest")) continue;
    const src = readFileSync(join(reviewDir, String(f)), "utf8");
    assert(!src.includes("agent-runtime"), `review/${f}: no agent-runtime`);
    assert(!src.includes("tool-registry"), `review/${f}: no tool-registry`);
    assert(!src.includes("memory-engine"), `review/${f}: no memory-engine`);
    assert(!src.includes("deploy.production"), `review/${f}: no deploy`);
    assert(
      !src.includes("project-engine/internal"),
      `review/${f}: no PE internal`
    );
  }

  console.log("engines-contracts.selftest: ok");
}

main();
