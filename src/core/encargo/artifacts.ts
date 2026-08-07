/**
 * Extract downloadable / previewable artifacts from agent text output.
 */

export type EncargoArtifactKind = "html" | "json" | "text";

export type EncargoArtifact = {
  kind: EncargoArtifactKind;
  filename: string;
  mime: string;
  content: string;
  previewHtml: string | null;
};

function unescapeFenced(body: string): string {
  return body.replace(/\r\n/g, "\n").trim();
}

/** Prefer fenced ```html / ```json blocks; else raw HTML/JSON documents. */
export function extractPrimaryArtifact(
  raw: string,
  serviceKey: string,
  clientName: string
): EncargoArtifact | null {
  const text = String(raw || "");
  if (!text.trim()) return null;

  const fenceHtml = text.match(/```(?:html|htm)\s*([\s\S]*?)```/i);
  if (fenceHtml?.[1]) {
    const content = unescapeFenced(fenceHtml[1]);
    if (content.includes("<")) {
      return htmlArtifact(content, serviceKey, clientName);
    }
  }

  const fenceJson = text.match(/```(?:json)\s*([\s\S]*?)```/i);
  if (fenceJson?.[1]) {
    const content = unescapeFenced(fenceJson[1]);
    try {
      JSON.parse(content);
      return jsonArtifact(content, serviceKey, clientName);
    } catch {
      /* fall through */
    }
  }

  const doctype = text.match(/(<!DOCTYPE html[\s\S]*<\/html\s*>)/i);
  if (doctype?.[1]) {
    return htmlArtifact(doctype[1].trim(), serviceKey, clientName);
  }

  const htmlOnly = text.match(/(<html[\s\S]*<\/html\s*>)/i);
  if (htmlOnly?.[1]) {
    return htmlArtifact(htmlOnly[1].trim(), serviceKey, clientName);
  }

  // Whole output is JSON
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      JSON.parse(trimmed);
      return jsonArtifact(trimmed, serviceKey, clientName);
    } catch {
      /* ignore */
    }
  }

  return null;
}

function slug(s: string): string {
  return (
    String(s || "entregable")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "entregable"
  );
}

function htmlArtifact(
  content: string,
  serviceKey: string,
  clientName: string
): EncargoArtifact {
  const name = `${slug(clientName)}-${serviceKey || "web"}.html`;
  return {
    kind: "html",
    filename: name,
    mime: "text/html;charset=utf-8",
    content,
    previewHtml: content,
  };
}

function jsonArtifact(
  content: string,
  serviceKey: string,
  clientName: string
): EncargoArtifact {
  const name = `${slug(clientName)}-${serviceKey || "automation"}.json`;
  return {
    kind: "json",
    filename: name,
    mime: "application/json;charset=utf-8",
    content,
    previewHtml: null,
  };
}

export function artifactLabel(kind: EncargoArtifactKind): string {
  if (kind === "html") return "Vista previa";
  if (kind === "json") return "Automatización (JSON)";
  return "Archivo";
}
