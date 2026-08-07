"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type ClientDeliverable = {
  deliverableId: string;
  title: string;
  kind: string;
  uri: string | null;
};

type ClientReview = {
  reviewId: string;
  status: string;
  expiresAt: string;
  projectId: string;
  versionId: string;
  deliverables: ClientDeliverable[];
  comments: Array<{ id: string; body: string; createdAt: string }>;
};

const STATUS_LABEL: Record<string, string> = {
  sent: "Enviada",
  viewed: "Vista",
  changes_requested: "Cambios solicitados",
  approved: "Aprobada",
  rejected: "Rechazada",
  revoked: "Revocada",
  draft: "Borrador",
};

export default function ReviewPortalPage() {
  const params = useParams();
  const token = String(params.token || "");
  const [review, setReview] = useState<ClientReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [comment, setComment] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/review/${encodeURIComponent(token)}`, {
        method: "GET",
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data.message || data.error || "No se pudo cargar la revisión"
        );
        setReview(null);
        return;
      }
      setReview(data.review as ClientReview);
    } catch {
      setError("Error de red");
      setReview(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function postAction(path: string, body?: object) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/review/${encodeURIComponent(token)}${path}`,
        {
          method: "POST",
          headers: body ? { "Content-Type": "application/json" } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || data.error || "Acción rechazada");
        return;
      }
      setReview(data.review as ClientReview);
      if (path === "/comments") setComment("");
    } catch {
      setError("Error de red");
    } finally {
      setBusy(false);
    }
  }

  async function onComment(e: FormEvent) {
    e.preventDefault();
    await postAction("/comments", { body: comment });
  }

  const open =
    review &&
    (review.status === "sent" ||
      review.status === "viewed" ||
      review.status === "changes_requested");

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "2.5rem 1.25rem 4rem",
      }}
    >
      <p
        style={{
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontSize: "0.75rem",
          color: "#8fa3bc",
          marginBottom: "0.5rem",
        }}
      >
        Altivox · Revisión privada
      </p>
      <h1
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontWeight: 500,
          fontSize: "2rem",
          margin: "0 0 0.75rem",
        }}
      >
        Entregables para revisión
      </h1>
      <p style={{ color: "#a8b8cc", marginBottom: "2rem", lineHeight: 1.5 }}>
        Este enlace es personal y temporal. No contiene acceso a sistemas
        internos.
      </p>

      {loading ? <p style={{ color: "#8fa3bc" }}>Cargando…</p> : null}
      {error ? (
        <p
          role="alert"
          style={{
            color: "#ffb4a8",
            background: "rgba(120,40,30,0.25)",
            padding: "0.75rem 1rem",
            borderRadius: 4,
          }}
        >
          {error}
        </p>
      ) : null}

      {review ? (
        <>
          <p style={{ marginBottom: "1.5rem" }}>
            Estado:{" "}
            <strong>{STATUS_LABEL[review.status] || review.status}</strong>
            <span style={{ color: "#8fa3bc", marginLeft: "0.75rem" }}>
              Caduca {new Date(review.expiresAt).toLocaleString("es-ES")}
            </span>
          </p>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
              Entregables
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {review.deliverables.map((d) => (
                <li
                  key={d.deliverableId}
                  style={{
                    padding: "1rem 0",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <strong>{d.title}</strong>
                  <span style={{ color: "#8fa3bc", marginLeft: 8 }}>
                    {d.kind}
                  </span>
                  {d.uri ? (
                    <div style={{ marginTop: 6 }}>
                      <a
                        href={d.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#7eb6ff" }}
                      >
                        Abrir entregable
                      </a>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
              Comentarios
            </h2>
            {review.comments.length === 0 ? (
              <p style={{ color: "#8fa3bc" }}>Aún no hay comentarios.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {review.comments.map((c) => (
                  <li
                    key={c.id}
                    style={{
                      padding: "0.65rem 0",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <time
                      dateTime={c.createdAt}
                      style={{ color: "#8fa3bc", fontSize: "0.85rem" }}
                    >
                      {new Date(c.createdAt).toLocaleString("es-ES")}
                    </time>
                    <p style={{ margin: "0.25rem 0 0" }}>{c.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {open ? (
            <>
              <form onSubmit={(e) => void onComment(e)} style={{ marginBottom: "1.5rem" }}>
                <label
                  htmlFor="review-comment"
                  style={{ display: "block", marginBottom: 6 }}
                >
                  Añadir comentario
                </label>
                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={busy}
                  required
                  rows={3}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.35)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#e8eef6",
                    padding: "0.75rem",
                    borderRadius: 4,
                  }}
                />
                <button
                  type="submit"
                  disabled={busy}
                  style={btnStyle}
                >
                  Enviar comentario
                </button>
              </form>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void postAction("/changes")}
                  style={btnStyleSecondary}
                >
                  Solicitar cambios
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void postAction("/approve")}
                  style={btnStyle}
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void postAction("/reject")}
                  style={btnStyleDanger}
                >
                  Rechazar
                </button>
              </div>
            </>
          ) : (
            <p style={{ color: "#8fa3bc" }}>
              Esta revisión ya no admite acciones del cliente.
            </p>
          )}
        </>
      ) : null}
    </main>
  );
}

const btnStyle: React.CSSProperties = {
  marginTop: "0.75rem",
  background: "#dce8f5",
  color: "#0c1017",
  border: "none",
  padding: "0.65rem 1.1rem",
  borderRadius: 4,
  cursor: "pointer",
  fontWeight: 600,
};

const btnStyleSecondary: React.CSSProperties = {
  ...btnStyle,
  background: "transparent",
  color: "#dce8f5",
  border: "1px solid rgba(220,232,245,0.35)",
};

const btnStyleDanger: React.CSSProperties = {
  ...btnStyle,
  background: "transparent",
  color: "#ffb4a8",
  border: "1px solid rgba(255,180,168,0.4)",
};
