/**
 * Minimal deterministic ZIP builder (Bloque 7 · ADR-017).
 * Pure Node zlib — no vendors, no network, no publish.
 */

import { createHash } from "node:crypto";
import { deflateRawSync, crc32 } from "node:zlib";
import type { DeployDeliverableRef } from "../types";

export type ZipFileEntry = {
  path: string;
  content: Buffer;
};

/** Fixed DOS date for reproducibility (1980-01-01 00:00:00). */
const DOS_TIME = 0;
const DOS_DATE = 0x0021;

function u16(n: number): Buffer {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(n & 0xffff, 0);
  return b;
}

function u32(n: number): Buffer {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n >>> 0, 0);
  return b;
}

function crcOf(buf: Buffer): number {
  // node:zlib crc32 available in Node 22+; fallback polyfill
  if (typeof crc32 === "function") {
    return Number(crc32(buf)) >>> 0;
  }
  return crc32Fallback(buf);
}

function crc32Fallback(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

/** Build a ZIP buffer from entries (paths sorted for reproducibility). */
export function buildZipBuffer(entries: ZipFileEntry[]): Buffer {
  const sorted = [...entries].sort((a, b) => a.path.localeCompare(b.path));
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;

  for (const entry of sorted) {
    const name = Buffer.from(entry.path, "utf8");
    const compressed = deflateRawSync(entry.content);
    const crc = crcOf(entry.content);
    const local = Buffer.concat([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(8), // deflate
      u16(DOS_TIME),
      u16(DOS_DATE),
      u32(crc),
      u32(compressed.length),
      u32(entry.content.length),
      u16(name.length),
      u16(0),
      name,
      compressed,
    ]);
    const central = Buffer.concat([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0),
      u16(8),
      u16(DOS_TIME),
      u16(DOS_DATE),
      u32(crc),
      u32(compressed.length),
      u32(entry.content.length),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name,
    ]);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }

  const centralDir = Buffer.concat(centrals);
  const end = Buffer.concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(sorted.length),
    u16(sorted.length),
    u32(centralDir.length),
    u32(offset),
    u16(0),
  ]);

  return Buffer.concat([...locals, centralDir, end]);
}

/**
 * Build deployment package ZIP from project/version + deliverable refs.
 * Content is deterministic given the same inputs.
 */
export function buildDeploymentZip(input: {
  deploymentId: string;
  projectId: string;
  versionId: string;
  deliverables: DeployDeliverableRef[];
}): { buffer: Buffer; sha256Hex: string; byteLength: number } {
  const manifest = {
    schema: "altivox.deployment.package.v1",
    deploymentId: input.deploymentId,
    projectId: input.projectId,
    versionId: input.versionId,
    deliverables: [...input.deliverables]
      .map((d) => ({
        deliverableId: d.deliverableId,
        title: d.title,
        kind: d.kind,
        uri: d.uri,
      }))
      .sort((a, b) => a.deliverableId.localeCompare(b.deliverableId)),
  };

  const entries: ZipFileEntry[] = [
    {
      path: "manifest.json",
      content: Buffer.from(JSON.stringify(manifest, null, 2) + "\n", "utf8"),
    },
    {
      path: "README.txt",
      content: Buffer.from(
        [
          "Altivox deployment package",
          `deployment: ${input.deploymentId}`,
          `project: ${input.projectId}`,
          `version: ${input.versionId}`,
          "",
          "Internal package only. No external publish.",
          "",
        ].join("\n"),
        "utf8"
      ),
    },
  ];

  for (const d of [...input.deliverables].sort((a, b) =>
    a.deliverableId.localeCompare(b.deliverableId)
  )) {
    const body =
      typeof d.content === "string" && d.content.length
        ? d.content
        : JSON.stringify(
            {
              deliverableId: d.deliverableId,
              title: d.title,
              kind: d.kind,
              uri: d.uri,
            },
            null,
            2
          ) + "\n";
    const safe = d.deliverableId.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
    entries.push({
      path: `deliverables/${safe}.json`,
      content: Buffer.from(body, "utf8"),
    });
  }

  const buffer = buildZipBuffer(entries);
  const sha256Hex = createHash("sha256").update(buffer).digest("hex");
  return { buffer, sha256Hex, byteLength: buffer.length };
}
