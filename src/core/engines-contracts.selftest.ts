/**
 * Bloque 4 engine frontier contracts — no accidental runtime.
 * Run: npx --yes tsx src/core/engines-contracts.selftest.ts
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AgentManagerBoundary } from "@/core/agent-manager";
import type { CapabilityRegistry } from "@/core/capability-registry";
import type { MemoryEngine } from "@/core/memory-engine";
import type { ToolRegistry } from "@/core/tool-registry";
import type { WorkflowEngine } from "@/core/workflow-engine";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function main() {
  // Type-only frontiers compile; runtime values must not be instantiated here.
  type Frontiers = [
    WorkflowEngine,
    ToolRegistry,
    MemoryEngine,
    CapabilityRegistry,
    AgentManagerBoundary,
  ];
  const _typeCheck: Frontiers | undefined = undefined;
  void _typeCheck;

  const coreRoot = join(dirname(fileURLToPath(import.meta.url)));
  const modules = [
    "workflow-engine",
    "tool-registry",
    "memory-engine",
    "capability-registry",
    "agent-manager",
  ] as const;

  for (const name of modules) {
    const dir = join(coreRoot, name);
    const files = readdirSync(dir);
    assert(
      files.every((f) => f === "index.ts"),
      `${name}: only index.ts allowed (no runtime extras), got ${files.join(",")}`
    );
    const src = readFileSync(join(dir, "index.ts"), "utf8");
    assert(src.includes("export interface"), `${name}: must export interface`);
    assert(
      !/\bexport\s+(async\s+)?function\b/.test(src),
      `${name}: no function exports (no runtime)`
    );
    assert(
      !/\bexport\s+class\b/.test(src),
      `${name}: no class exports (no runtime)`
    );
    assert(
      !/\bexport\s+const\b/.test(src),
      `${name}: no const runtime exports`
    );
    assert(
      !src.includes("supabase") && !src.includes("createClient"),
      `${name}: no supabase`
    );
    assert(!src.includes("service_role"), `${name}: no service_role`);
  }

  console.log("engines-contracts.selftest: ok");
}

main();
