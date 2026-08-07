"use client";

import { useEffect, useMemo, useState } from "react";
import {
  artifactLabel,
  extractPrimaryArtifact,
  type EncargoArtifact,
} from "@/core/encargo/artifacts";

type Props = {
  output: string;
  serviceKey: string;
  clientName: string;
};

function downloadArtifact(art: EncargoArtifact) {
  const blob = new Blob([art.content], { type: art.mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = art.filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function EncargoDeliverablePreview({
  output,
  serviceKey,
  clientName,
}: Props) {
  const artifact = useMemo(
    () => extractPrimaryArtifact(output, serviceKey, clientName),
    [output, serviceKey, clientName]
  );

  const [tabUrl, setTabUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!artifact?.previewHtml) {
      setTabUrl(null);
      return;
    }
    const url = URL.createObjectURL(
      new Blob([artifact.previewHtml], { type: "text/html;charset=utf-8" })
    );
    setTabUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [artifact]);

  if (!artifact) {
    return (
      <p className="ops-field-hint" style={{ marginTop: "0.75rem" }}>
        Aún no hay archivo embebido (HTML/JSON) en la salida del agente de
        código. Al completar el paso Código aparecerá aquí la vista previa y la
        descarga.
      </p>
    );
  }

  return (
    <section className="ops-deliverable" aria-label="Entregable">
      <div className="ops-deliverable-bar">
        <div>
          <strong>{artifactLabel(artifact.kind)}</strong>
          <span className="ops-mono"> {artifact.filename}</span>
        </div>
        <div className="ops-form-actions">
          <button
            type="button"
            className="ops-btn ops-btn-primary"
            onClick={() => downloadArtifact(artifact)}
          >
            Descargar
          </button>
          {tabUrl ? (
            <a className="ops-btn" href={tabUrl} target="_blank" rel="noreferrer">
              Abrir en pestaña
            </a>
          ) : null}
        </div>
      </div>

      {tabUrl ? (
        <iframe
          className="ops-deliverable-frame"
          title={`Preview ${artifact.filename}`}
          sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          allow="fullscreen; autoplay; xr-spatial-tracking"
          src={tabUrl}
        />
      ) : artifact.previewHtml ? (
        <div className="ops-deliverable-frame" style={{ display: "grid", placeItems: "center" }}>
          <span className="ops-field-hint">Preparando vista previa…</span>
        </div>
      ) : (
        <pre className="ops-console" style={{ marginTop: "0.65rem" }}>
          {artifact.content.slice(0, 4000)}
        </pre>
      )}
    </section>
  );
}
