/**
 * Package blob store for deployment ZIPs (Bloque 7 · ADR-017).
 * Memory for selftests; filesystem when not in selftest (no vendors).
 */

import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
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
  return (
    String(process.env.ALTIVOX_DEPLOY_PACKAGE_DIR || "").trim() ||
    join(process.cwd(), ".altivox-packages")
  );
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
    if (!existsSync(root)) mkdirSync(root, { recursive: true });
    const dir = join(root, deploymentId);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const file = join(dir, `${sha256}.zip`);
    writeFileSync(file, buffer);
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
