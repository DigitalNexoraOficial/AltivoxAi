"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { OpsBreadcrumbs } from "@/components/ops/OpsBreadcrumbs";
import { useOpsSession } from "@/components/ops/OpsSessionProvider";
import {
  createVersion,
  getProject,
  listTimeline,
  listReviews,
  createReview,
  revokeReview,
  OpsApiError,
  OPS_PROJECT_STATUSES,
  registerDeliverable,
  transitionProject,
  updateProjectMeta,
  type OpsEvent,
  type OpsProject,
  type OpsVersion,
  type OpsDeliverable,
  type OpsReviewSession,
} from "@/lib/ops-api";

export default function OpsProjectDetailPage() {
  const params = useParams();
  const id = String(params.id || "");
  const { can, loading: sessionLoading } = useOpsSession();

  const [project, setProject] = useState<OpsProject | null>(null);
  const [events, setEvents] = useState<OpsEvent[]>([]);
  const [versionsLocal, setVersionsLocal] = useState<OpsVersion[]>([]);
  const [deliverablesLocal, setDeliverablesLocal] = useState<OpsDeliverable[]>(
    []
  );
  const [reviews, setReviews] = useState<OpsReviewSession[]>([]);
  const [lastPortalPath, setLastPortalPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [toStatus, setToStatus] = useState("");
  const [verLabel, setVerLabel] = useState("");
  const [verNotes, setVerNotes] = useState("");
  const [delTitle, setDelTitle] = useState("");
  const [delKind, setDelKind] = useState("artifact");
  const [delUri, setDelUri] = useState("");
  const [delVersionId, setDelVersionId] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [p, timeline, reviewList] = await Promise.all([
        getProject(id),
        listTimeline(id),
        listReviews(id).catch(() => [] as OpsReviewSession[]),
      ]);
      setProject(p);
      setEvents(timeline);
      setReviews(reviewList);
      setName(p.name);
      setServiceType(p.serviceType);
      setDescription(p.description || "");
      setToStatus("");
    } catch (e) {
      if (e instanceof OpsApiError) {
        setError(
          e.status === 403
            ? "403 — sin permiso project.read"
            : e.status === 404
              ? "Proyecto no encontrado"
              : `${e.code}: ${e.message}`
        );
      } else {
        setError("Error al cargar");
      }
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!sessionLoading) void load();
  }, [sessionLoading, load]);

  function mapErr(e: unknown, fallback: string): string {
    if (e instanceof OpsApiError) {
      if (e.status === 403) return `403 — ${e.message || "forbidden"}`;
      if (e.status === 409) return `Conflicto — ${e.message}`;
      return `${e.code}: ${e.message}`;
    }
    return fallback;
  }

  async function onSaveMeta(e: FormEvent) {
    e.preventDefault();
    if (!project) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await updateProjectMeta(project.id, {
        name,
        serviceType,
        description,
      });
      setProject(updated);
    } catch (err) {
      setError(mapErr(err, "No se pudo guardar"));
    } finally {
      setBusy(false);
    }
  }

  async function onTransition(e: FormEvent) {
    e.preventDefault();
    if (!project || !toStatus) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await transitionProject(project.id, toStatus);
      setProject(updated);
      const timeline = await listTimeline(project.id);
      setEvents(timeline);
      setToStatus("");
    } catch (err) {
      setError(mapErr(err, "Transición rechazada"));
    } finally {
      setBusy(false);
    }
  }

  async function onVersion(e: FormEvent) {
    e.preventDefault();
    if (!project) return;
    setBusy(true);
    setError(null);
    try {
      const version = await createVersion(project.id, {
        label: verLabel.trim(),
        notes: verNotes,
      });
      setVersionsLocal((prev) => [version, ...prev]);
      setVerLabel("");
      setVerNotes("");
      const timeline = await listTimeline(project.id);
      setEvents(timeline);
    } catch (err) {
      setError(mapErr(err, "No se pudo crear versión"));
    } finally {
      setBusy(false);
    }
  }

  async function onDeliverable(e: FormEvent) {
    e.preventDefault();
    if (!project) return;
    setBusy(true);
    setError(null);
    try {
      const deliverable = await registerDeliverable(project.id, {
        title: delTitle.trim(),
        kind: delKind.trim() || "artifact",
        uri: delUri.trim() || null,
        versionId: delVersionId.trim() || null,
      });
      setDeliverablesLocal((prev) => [deliverable, ...prev]);
      setDelTitle("");
      setDelUri("");
      setDelVersionId("");
      const timeline = await listTimeline(project.id);
      setEvents(timeline);
    } catch (err) {
      setError(mapErr(err, "No se pudo registrar entregable"));
    } finally {
      setBusy(false);
    }
  }

  async function onCreateReview(e: FormEvent) {
    e.preventDefault();
    if (!project) return;
    const versionId =
      delVersionId.trim() || versionsLocal[0]?.id || "";
    if (!versionId) {
      setError("Se necesita versionId (crea una versión o indícala en Deliverable)");
      return;
    }
    if (deliverablesLocal.length === 0) {
      setError("Registra al menos un deliverable local para el snapshot");
      return;
    }
    setBusy(true);
    setError(null);
    setLastPortalPath(null);
    try {
      const result = await createReview({
        projectId: project.id,
        versionId,
        deliverables: deliverablesLocal.map((d) => ({
          deliverableId: d.id,
          title: d.title,
          kind: d.kind,
          uri: d.uri,
        })),
      });
      setReviews((prev) => [result.review, ...prev]);
      if (result.portalPath) setLastPortalPath(result.portalPath);
    } catch (err) {
      setError(mapErr(err, "No se pudo crear review"));
    } finally {
      setBusy(false);
    }
  }

  async function onRevokeReview(reviewId: string) {
    setBusy(true);
    setError(null);
    try {
      const result = await revokeReview(reviewId);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? result.review : r))
      );
    } catch (err) {
      setError(mapErr(err, "No se pudo revocar review"));
    } finally {
      setBusy(false);
    }
  }

  if (loading || sessionLoading) {
    return <p className="ops-muted">Cargando proyecto…</p>;
  }

  if (!project) {
    return (
      <>
        <OpsBreadcrumbs
          items={[
            { href: "/ops", label: "Ops" },
            { href: "/ops/projects", label: "Proyectos" },
            { label: "Detalle" },
          ]}
        />
        {error ? <div className="ops-error">{error}</div> : null}
        <Link href="/ops/projects" className="ops-btn ops-btn-ghost">
          Volver al listado
        </Link>
      </>
    );
  }

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/ops", label: "Ops" },
          { href: "/ops/projects", label: "Proyectos" },
          { label: project.name },
        ]}
      />
      <h1 className="ops-page-title">{project.name}</h1>
      <p className="ops-lede">
        Estado <span className="ops-status">{project.status}</span>
        {" · "}
        <span className="ops-mono">{project.serviceType}</span>
        {" · "}
        <span className="ops-mono">{project.id}</span>
      </p>

      {error ? <div className="ops-error">{error}</div> : null}

      <div className="ops-stack">
        <section className="ops-panel">
          <h2>Metadatos</h2>
          <form className="ops-form" onSubmit={(e) => void onSaveMeta(e)}>
            <div className="ops-form-row">
              <label htmlFor="meta-name">Nombre</label>
              <input
                id="meta-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!can("project.update") || busy}
              />
            </div>
            <div className="ops-form-row">
              <label htmlFor="meta-service">service_type</label>
              <input
                id="meta-service"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                disabled={!can("project.update") || busy}
              />
            </div>
            <div className="ops-form-row">
              <label htmlFor="meta-desc">Descripción</label>
              <textarea
                id="meta-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!can("project.update") || busy}
              />
            </div>
            {can("project.update") ? (
              <div className="ops-form-actions">
                <button className="ops-btn" type="submit" disabled={busy}>
                  Guardar
                </button>
              </div>
            ) : (
              <p className="ops-muted">Sin project.update — solo lectura.</p>
            )}
          </form>
        </section>

        <section className="ops-panel">
          <h2>Transición de estado</h2>
          <p className="ops-muted">
            El servidor valida la máquina de estados. Una transición ilegal
            devuelve error (no se calcula el grafo en el cliente).
          </p>
          <form className="ops-form" onSubmit={(e) => void onTransition(e)}>
            <div className="ops-form-row">
              <label htmlFor="to-status">Nuevo estado</label>
              <select
                id="to-status"
                value={toStatus}
                onChange={(e) => setToStatus(e.target.value)}
                disabled={busy}
              >
                <option value="">Seleccionar…</option>
                {OPS_PROJECT_STATUSES.filter((s) => s !== project.status).map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  )
                )}
              </select>
            </div>
            <div className="ops-form-actions">
              <button
                className="ops-btn"
                type="submit"
                disabled={busy || !toStatus}
              >
                Aplicar transición
              </button>
            </div>
          </form>
        </section>

        <section className="ops-panel">
          <h2>Versión</h2>
          <form className="ops-form" onSubmit={(e) => void onVersion(e)}>
            <div className="ops-form-row">
              <label htmlFor="ver-label">Label</label>
              <input
                id="ver-label"
                value={verLabel}
                onChange={(e) => setVerLabel(e.target.value)}
                disabled={busy}
                required
              />
            </div>
            <div className="ops-form-row">
              <label htmlFor="ver-notes">Notas</label>
              <textarea
                id="ver-notes"
                value={verNotes}
                onChange={(e) => setVerNotes(e.target.value)}
                disabled={busy}
              />
            </div>
            <div className="ops-form-actions">
              <button className="ops-btn" type="submit" disabled={busy}>
                Crear versión
              </button>
            </div>
          </form>
          {versionsLocal.length > 0 ? (
            <ul className="ops-timeline" style={{ marginTop: "0.75rem" }}>
              {versionsLocal.map((v) => (
                <li key={v.id}>
                  <strong>{v.label}</strong>
                  <span className="ops-mono"> {v.id}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="ops-panel">
          <h2>Deliverable</h2>
          <form className="ops-form" onSubmit={(e) => void onDeliverable(e)}>
            <div className="ops-form-row">
              <label htmlFor="del-title">Título</label>
              <input
                id="del-title"
                value={delTitle}
                onChange={(e) => setDelTitle(e.target.value)}
                disabled={busy}
                required
              />
            </div>
            <div className="ops-form-row">
              <label htmlFor="del-kind">Kind</label>
              <input
                id="del-kind"
                value={delKind}
                onChange={(e) => setDelKind(e.target.value)}
                disabled={busy}
              />
            </div>
            <div className="ops-form-row">
              <label htmlFor="del-uri">URI (opcional)</label>
              <input
                id="del-uri"
                value={delUri}
                onChange={(e) => setDelUri(e.target.value)}
                disabled={busy}
              />
            </div>
            <div className="ops-form-row">
              <label htmlFor="del-ver">versionId (opcional)</label>
              <input
                id="del-ver"
                value={delVersionId}
                onChange={(e) => setDelVersionId(e.target.value)}
                disabled={busy}
                placeholder="uuid de versión"
              />
            </div>
            <div className="ops-form-actions">
              <button className="ops-btn" type="submit" disabled={busy}>
                Registrar entregable
              </button>
            </div>
          </form>
          {deliverablesLocal.length > 0 ? (
            <ul className="ops-timeline" style={{ marginTop: "0.75rem" }}>
              {deliverablesLocal.map((d) => (
                <li key={d.id}>
                  <strong>{d.title}</strong>
                  <span className="ops-mono"> {d.kind}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="ops-panel">
          <h2>Review cliente (B6)</h2>
          <p className="ops-muted">
            Emite un enlace <code>/r/[token]</code>. La aprobación del cliente{" "}
            <strong>no</strong> cambia el estado PE automáticamente.
          </p>
          {can("review.create") ? (
            <form className="ops-form" onSubmit={(e) => void onCreateReview(e)}>
              <div className="ops-form-actions">
                <button
                  className="ops-btn"
                  type="submit"
                  disabled={busy || deliverablesLocal.length === 0}
                >
                  Emitir review (snapshot deliverables locales)
                </button>
              </div>
            </form>
          ) : (
            <p className="ops-muted">Sin permiso review.create</p>
          )}
          {lastPortalPath ? (
            <p className="ops-mono" style={{ marginTop: "0.75rem" }}>
              Portal (mostrar una vez): {lastPortalPath}
            </p>
          ) : null}
          {reviews.length > 0 ? (
            <ul className="ops-timeline" style={{ marginTop: "0.75rem" }}>
              {reviews.map((r) => (
                <li key={r.id}>
                  <strong>{r.status}</strong>
                  <span className="ops-mono"> {r.id}</span>
                  {r.status !== "revoked" && can("review.revoke") ? (
                    <button
                      type="button"
                      className="ops-btn ops-btn-ghost"
                      style={{ marginLeft: 8 }}
                      disabled={busy}
                      onClick={() => void onRevokeReview(r.id)}
                    >
                      Revocar
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="ops-muted">Sin reviews aún.</p>
          )}
        </section>

        <section className="ops-panel">
          <h2>Timeline</h2>
          {events.length === 0 ? (
            <p className="ops-muted">Sin eventos de dominio.</p>
          ) : (
            <ul className="ops-timeline">
              {events.map((ev) => (
                <li key={ev.id}>
                  <time dateTime={ev.createdAt}>
                    {new Date(ev.createdAt).toLocaleString("es-ES")}
                  </time>
                  <strong>{ev.eventType}</strong>
                  <div className="ops-mono">
                    {ev.actorType}:{ev.actorId || "—"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
