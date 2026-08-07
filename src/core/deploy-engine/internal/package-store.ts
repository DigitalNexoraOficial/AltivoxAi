/**
 * Package blob store for deployment ZIPs (Bloque 7 · ADR-017).
 * Memory for selftests; filesystem when not in selftest (no vendors).
 *
 * Prefer OS temp dir: serverless runtimes mount the app dir read-only
 * (e.g. cwd `/var/task`), so mkdir under process.cwd() fails.
 */

import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DeployError } from "../errors";

export type StoredPackage = {
  uri: string;
  sha256: string;
  byteLength: number;
};

const memoryBlobs = new Map<string, Buffer>();

function useMemory(): boolean {
  return (
    process.env.ALTIVOX_SELFTEST === "1" ||
    process.env.ALTIVOX_DEPLOY_STORE === "memory"
  );
}

function packageRoot(): string {
  const override = String(process.env.ALTIVOX_DEPLOY_PACKAGE_DIR || "").trim();
  if (override) return override;
  // Writable on local + serverless. App cwd is often read-only in lambdas.
  return join(/*turbopackIgnore: true*/ tmpdir(), "altivox-packages");
}

export function storePackageBlob(
  deploymentId: string,
  buffer: Buffer,
  sha256: string
): StoredPackage {
  if (useMemory()) {
    const uri = `memory://deployments/${deploymentId}/${sha256}.zip`;
    memoryBlobs.set(uri, buffer);
    return { uri, sha256, byteLength: buffer.length };
  }

  try {
    const root = packageRoot();
    if (!existsSync(/*turbopackIgnore: true*/ root)) {
      mkdirSync(/*turbopackIgnore: true*/ root, { recursive: true });
    }
    const dir = join(/*turbopackIgnore: true*/ root, deploymentId);
    if (!existsSync(/*turbopackIgnore: true*/ dir)) {
      mkdirSync(/*turbopackIgnore: true*/ dir, { recursive: true });
    }
    const file = join(/*turbopackIgnore: true*/ dir, `${sha256}.zip`);
    writeFileSync(/*turbopackIgnore: true*/ file, buffer);
    return {
      uri: `file://${file}`,
      sha256,
      byteLength: buffer.length,
    };
  } catch (err) {
    throw new DeployError(
      "packaging_error",
      err instanceof Error ? err.message : "package_store_failed"
    );
  }
}

/** Selftests / inspection. */
export function getMemoryPackage(uri: string): Buffer | null {
  return memoryBlobs.get(uri) ?? null;
}

export function resetPackageStoreForTests(): void {
  memoryBlobs.clear();
}

export function hashBuffer(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

export function newPackageId(): string {
  return randomUUID();
}
