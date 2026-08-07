"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { OpsBreadcrumbs } from "@/components/ops/OpsBreadcrumbs";
import { useOpsSession } from "@/components/ops/OpsSessionProvider";
import {
  createDeployment,
  createVersion,
  getProject,
  listDeployments,
  listTimeline,
  listReviews,
  createReview,
  revokeReview,
  executeDeployment,
  OpsApiError,
  OPS_PROJECT_STATUSES,
  OPS_SERVICE_TYPE_HINTS,
  registerDeliverable,
  transitionProject,
  updateProjectMeta,
  type OpsDeployment,
  type OpsEvent,
  type OpsProject,
  type OpsVersion,
  type OpsDeliverable,
  type OpsReviewSession,
} from "@/lib/ops-api";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function storageKey(projectId: string, kind: "versions" | "deliverables") {
  return `altivox.ops.${kind}.${projectId}`;
}

function readLocalJson<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeLocalJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

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
  const [deployments, setDeployments] = useState<OpsDeployment[]>([]);
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
  const [reviewVersionId, setReviewVersionId] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [p, timeline] = await Promise.all([
        getProject(id),
        listTimeline(id),
      ]);
      setProject(p);
      setEvents(timeline);
      setName(p.name);
      setServiceType(p.serviceType);
      setDescription(p.description || "");
      setToStatus("");

      const storedVersions = readLocalJson<OpsVersion>(
        storageKey(id, "versions")
      );
      const storedDeliverables = readLocalJson<OpsDeliverable>(
        storageKey(id, "deliverables")
      );
      setVersionsLocal(storedVersions);
      setDeliverablesLocal(storedDeliverables);
      if (storedVersions[0]?.id) {
        setReviewVersionId((prev) => prev || storedVersions[0].id);
        setDelVersionId((prev) => prev || storedVersions[0].id);
      }

      try {
        setReviews(await listReviews(id));
      } catch (re) {
        setReviews([]);
        if (re instanceof OpsApiError) {
          setError(`Reviews — ${re.code}: ${re.message}`);
        } else {
          setError("Reviews — error al listar");
        }
      }

      try {
        setDeployments(await listDeployments(id));
      } catch {
        setDeployments([]);
      }
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

  useEffect(() => {
    if (!id) return;
    writeLocalJson(storageKey(id, "versions"), versionsLocal);
  }, [id, versionsLocal]);

  useEffect(() => {
    if (!id) return;
    writeLocalJson(storageKey(id, "deliverables"), deliverablesLocal);
  }, [id, deliverablesLocal]);

  const flow = useMemo(() => {
    const hasVersion = versionsLocal.length > 0;
    const hasDeliverable = deliverablesLocal.length > 0;
    const hasReview = reviews.some((r) => r.status !== "revoked");
    const hasPackaged = deployments.some((d) => d.status === "packaged");
    return [
      { id: "meta", label: "1 · Datos", done: Boolean(project) },
      { id: "status", label: "2 · Estado", done: project?.status !== "draft" },
      { id: "version", label: "3 · Versión", done: hasVersion },
      { id: "deliverable", label: "4 · Entregable", done: hasDeliverable },
      { id: "review", label: "5 · Review", done: hasReview },
      { id: "deploy", label: "6 · Deploy", done: hasPackaged },
    ];
  }, [project, versionsLocal, deliverablesLocal, reviews, deployments]);

  function mapErr(e: unknown, fallback: string): string {
    if (e instanceof OpsApiError) {
      if (e.status === 403) return `403 — ${e.message || "forbidden"}`;
      if (e.status === 409) return `Conflicto — ${e.message}`;
      return `${e.code}: ${e.message}`;
    }
    return fallback;
  }

  function resolveVersionUuid(raw: string): string | null {
    const t = raw.trim();
    if (UUID_RE.test(t)) return t;
    if (!t && versionsLocal[0]) return versionsLocal[0].id;
    const byLabel = versionsLocal.find(
      (v) => v.label.toLowerCase() === t.toLowerCase()
    );
    if (byLabel) return byLabel.id;
    if (delVersionId.trim() && UUID_RE.test(delVersionId.trim())) {
      return delVersionId.trim();
    }
    return null;
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
      setReviewVersionId(version.id);
      setDelVersionId(version.id);
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
      const versionId =
        resolveVersionUuid(delVersionId) || versionsLocal[0]?.id || null;
      const deliverable = await registerDeliverable(project.id, {
        title: delTitle.trim(),
        kind: delKind.trim() || "artifact",
        uri: delUri.trim() || null,
        versionId,
      });
      setDeliverablesLocal((prev) => [deliverable, ...prev]);
      setDelTitle("");
      setDelUri("");
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
    const versionId = resolveVersionUuid(
      reviewVersionId || versionsLocal[0]?.id || ""
    );
    if (!versionId) {
      setError(
        'Elige una versión de la lista (UUID). No uses el label "v1" a mano.'
      );
      return;
    }
    if (deliverablesLocal.length === 0) {
      setError(
        "Primero registra un entregable en el paso 4 (se guarda en esta sesión del navegador)."
      );
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

  async function onDeploy(e: FormEvent) {
    e.preventDefault();
    if (!project) return;
    const versionId = resolveVersionUuid(
      reviewVersionId || versionsLocal[0]?.id || ""
    );
    if (!versionId) {
      setError("Necesitas una versión (paso 3) antes del deploy.");
      return;
    }
    if (deliverablesLocal.length === 0) {
      setError("Necesitas al menos un entregable (paso 4) para empaquetar.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const created = await createDeployment({
        projectId: project.id,
        versionId,
        deliverables: deliverablesLocal.map((d) => ({
          deliverableId: d.id,
          title: d.title,
          kind: d.kind,
          uri: d.uri,
        })),
      });
      const executed = await executeDeployment(created.deployment.id);
      setDeployments((prev) => [executed.deployment, ...prev]);
    } catch (err) {
      setError(mapErr(err, "No se pudo ejecutar deploy"));
      try {
        setDeployments(await listDeployments(project.id));
      } catch {
        /* ignore */
      }
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

  const currentStep =
    flow.find((s) => !s.done)?.id || flow[flow.length - 1]?.id;

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
        tipo <span className="ops-mono">{project.serviceType}</span>
        {" · "}
        <span className="ops-mono">{project.id}</span>
      </p>

      <p className="ops-help" style={{ marginTop: "-0.75rem" }}>
        Flujo recomendado: datos → (estado opcional) → versión → entregable →
        review cliente → empaquetar deploy. El tipo de servicio es solo una
        etiqueta: no genera chatbot ni automatización sola.
      </p>

      <ul className="ops-flow" aria-label="Progreso del proyecto">
        {flow.map((s) => (
          <li
            key={s.id}
            className={
              s.done ? "is-done" : s.id === currentStep ? "is-current" : ""
            }
          >
            {s.label}
            {s.done ? " ✓" : ""}
          </li>
        ))}
      </ul>

      <nav className="ops-anchor-nav" aria-label="Ir a sección">
        <a href="#paso-datos">Datos</a>
        <a href="#paso-estado">Estado</a>
        <a href="#paso-version">Versión</a>
        <a href="#paso-entregable">Entregable</a>
        <a href="#paso-review">Review</a>
        <a href="#paso-deploy">Deploy</a>
        <a href="#paso-timeline">Timeline</a>
      </nav>

      {error ? <div className="ops-error">{error}</div> : null}

      <div className="ops-stack">
        <section className="ops-panel" id="paso-datos">
          <div className="ops-step-head">
            <span className="ops-step-num">1</span>
            <h2>Datos del proyecto</h2>
          </div>
          <p className="ops-help">
            Nombre visible y tipo de servicio (texto libre). Hoy el módulo
            operativo real es <strong>web</strong>; otros valores son
            clasificación interna.
          </p>
          <form className="ops-form" onSubmit={(e) => void onSaveMeta(e)}>
            <div className="ops-form-row">
              <label htmlFor="meta-name">Nombre del proyecto</label>
              <input
                id="meta-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!can("project.update") || busy}
                placeholder="Ej. Web Clínica Sol"
              />
            </div>
            <div className="ops-form-row">
              <label htmlFor="meta-service">Tipo de servicio</label>
              <input
                id="meta-service"
                list="service-hints"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                disabled={!can("project.update") || busy}
                placeholder="web"
              />
              <datalist id="service-hints">
                {OPS_SERVICE_TYPE_HINTS.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </datalist>
              <p className="ops-field-hint">
                Sugerido: <span className="ops-mono">web</span>. Chatbot /
                automation = etiqueta, no entrega automática.
              </p>
            </div>
            <div className="ops-form-row">
              <label htmlFor="meta-desc">Descripción (opcional)</label>
              <textarea
                id="meta-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!can("project.update") || busy}
                placeholder="Notas internas para el equipo"
              />
            </div>
            {can("project.update") ? (
              <div className="ops-form-actions">
                <button className="ops-btn" type="submit" disabled={busy}>
                  Guardar datos
                </button>
              </div>
            ) : (
              <p className="ops-muted">Sin project.update — solo lectura.</p>
            )}
          </form>
        </section>

        <section className="ops-panel" id="paso-estado">
          <div className="ops-step-head">
            <span className="ops-step-num">2</span>
            <h2>Estado interno (PE)</h2>
          </div>
          <p className="ops-help">
            Máquina de estados del proyecto. La aprobación del cliente en Review{" "}
            <strong>no</strong> cambia esto sola. Puedes dejarlo en{" "}
            <span className="ops-mono">draft</span> al principio.
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

        <section className="ops-panel" id="paso-version">
          <div className="ops-step-head">
            <span className="ops-step-num">3</span>
            <h2>Versión</h2>
          </div>
          <p className="ops-help">
            Crea un hito (ej. <span className="ops-mono">v1</span>). El sistema
            guarda un <strong>UUID</strong>; ese UUID es el que usan Review y
            Deploy (no el texto &quot;v1&quot;).
          </p>
          <form className="ops-form" onSubmit={(e) => void onVersion(e)}>
            <div className="ops-form-row">
              <label htmlFor="ver-label">Label (nombre corto)</label>
              <input
                id="ver-label"
                value={verLabel}
                onChange={(e) => setVerLabel(e.target.value)}
                disabled={busy}
                required
                placeholder="v1"
              />
              <p className="ops-field-hint">Solo etiqueta humana. Ej. v1, v1.1</p>
            </div>
            <div className="ops-form-row">
              <label htmlFor="ver-notes">Notas (opcional)</label>
              <textarea
                id="ver-notes"
                value={verNotes}
                onChange={(e) => setVerNotes(e.target.value)}
                disabled={busy}
                placeholder="Qué incluye esta versión"
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
                  <div className="ops-mono">{v.id}</div>
                  <button
                    type="button"
                    className="ops-btn ops-btn-ghost"
                    style={{ marginTop: 6 }}
                    disabled={busy}
                    onClick={() => {
                      setReviewVersionId(v.id);
                      setDelVersionId(v.id);
                    }}
                  >
                    Usar en entregable / review / deploy
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ops-muted" style={{ marginTop: "0.75rem" }}>
              Aún no hay versiones en esta sesión del navegador. Crea una arriba.
            </p>
          )}
        </section>

        <section className="ops-panel" id="paso-entregable">
          <div className="ops-step-head">
            <span className="ops-step-num">4</span>
            <h2>Entregable</h2>
          </div>
          <p className="ops-help">
            Pieza que el cliente verá en la review (ej. Home, Landing). El
            snapshot de Review usa los entregables de <strong>esta sesión</strong>{" "}
            del navegador.
          </p>
          <form className="ops-form" onSubmit={(e) => void onDeliverable(e)}>
            <div className="ops-form-row">
              <label htmlFor="del-title">Título</label>
              <input
                id="del-title"
                value={delTitle}
                onChange={(e) => setDelTitle(e.target.value)}
                disabled={busy}
                required
                placeholder="Home"
              />
            </div>
            <div className="ops-form-row">
              <label htmlFor="del-kind">Tipo</label>
              <input
                id="del-kind"
                value={delKind}
                onChange={(e) => setDelKind(e.target.value)}
                disabled={busy}
                placeholder="artifact"
              />
              <p className="ops-field-hint">
                Normalmente <span className="ops-mono">artifact</span>
              </p>
            </div>
            <div className="ops-form-row">
              <label htmlFor="del-uri">Enlace / URI (opcional)</label>
              <input
                id="del-uri"
                value={delUri}
                onChange={(e) => setDelUri(e.target.value)}
                disabled={busy}
                placeholder="https://… o ruta interna"
              />
            </div>
            <div className="ops-form-row">
              <label htmlFor="del-ver">Versión asociada</label>
              {versionsLocal.length > 0 ? (
                <select
                  id="del-ver"
                  value={delVersionId || versionsLocal[0]?.id || ""}
                  onChange={(e) => setDelVersionId(e.target.value)}
                  disabled={busy}
                >
                  {versionsLocal.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label} — {v.id}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="del-ver"
                  value={delVersionId}
                  onChange={(e) => setDelVersionId(e.target.value)}
                  disabled={busy}
                  placeholder="Crea primero una versión (paso 3)"
                />
              )}
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
          ) : (
            <p className="ops-muted" style={{ marginTop: "0.75rem" }}>
              Sin entregables en sesión — Review y Deploy estarán bloqueados.
            </p>
          )}
        </section>

        <section className="ops-panel" id="paso-review">
          <div className="ops-step-head">
            <span className="ops-step-num">5</span>
            <h2>Review cliente</h2>
          </div>
          <p className="ops-help">
            Genera un enlace privado <span className="ops-mono">/r/[token]</span>{" "}
            para que el cliente vea los entregables y apruebe. Guarda el enlace:
            el token solo se muestra una vez.
          </p>
          {can("review.create") ? (
            <form className="ops-form" onSubmit={(e) => void onCreateReview(e)}>
              <div className="ops-form-row">
                <label htmlFor="review-ver">Versión a revisar</label>
                {versionsLocal.length > 0 ? (
                  <select
                    id="review-ver"
                    value={reviewVersionId || versionsLocal[0]?.id || ""}
                    onChange={(e) => setReviewVersionId(e.target.value)}
                    disabled={busy}
                  >
                    {versionsLocal.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label} — {v.id}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="review-ver"
                    value={reviewVersionId}
                    onChange={(e) => setReviewVersionId(e.target.value)}
                    disabled={busy}
                    placeholder="UUID de versión (paso 3)"
                    required
                  />
                )}
              </div>
              <div className="ops-form-actions">
                <button
                  className="ops-btn"
                  type="submit"
                  disabled={busy || deliverablesLocal.length === 0}
                >
                  Emitir review
                </button>
              </div>
            </form>
          ) : (
            <p className="ops-muted">Sin permiso review.create</p>
          )}
          {lastPortalPath ? (
            <p className="ops-ok" style={{ marginTop: "0.75rem" }}>
              Enlace cliente (copiar ahora):{" "}
              <a
                className="ops-mono"
                href={lastPortalPath}
                target="_blank"
                rel="noreferrer"
              >
                {typeof window !== "undefined"
                  ? `${window.location.origin}${lastPortalPath}`
                  : lastPortalPath}
              </a>
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

        <section className="ops-panel" id="paso-deploy">
          <div className="ops-step-head">
            <span className="ops-step-num">6</span>
            <h2>Deploy (paquete ZIP)</h2>
          </div>
          <p className="ops-help">
            Empaqueta la versión + entregables de esta sesión. No publica a un
            hosting externo: deja el deployment en estado{" "}
            <span className="ops-mono">packaged</span>.
          </p>
          {can("deploy.create") && can("deploy.execute") ? (
            <form className="ops-form" onSubmit={(e) => void onDeploy(e)}>
              <div className="ops-form-actions">
                <button
                  className="ops-btn"
                  type="submit"
                  disabled={
                    busy ||
                    deliverablesLocal.length === 0 ||
                    versionsLocal.length === 0
                  }
                >
                  Crear y ejecutar packaging
                </button>
              </div>
            </form>
          ) : (
            <p className="ops-muted">
              Sin permisos deploy.create / deploy.execute
            </p>
          )}
          {deployments.length > 0 ? (
            <ul className="ops-timeline" style={{ marginTop: "0.75rem" }}>
              {deployments.map((d) => (
                <li key={d.id}>
                  <strong>{d.status}</strong>
                  <div className="ops-mono">{d.id}</div>
                  {d.packageUri ? (
                    <div className="ops-mono">{d.packageUri}</div>
                  ) : null}
                  {d.error ? (
                    <div className="ops-error" style={{ marginTop: 6 }}>
                      {d.error}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="ops-muted">Sin deployments aún.</p>
          )}
        </section>

        <section className="ops-panel" id="paso-timeline">
          <div className="ops-step-head">
            <span className="ops-step-num">·</span>
            <h2>Timeline</h2>
          </div>
          <p className="ops-help">Historial de eventos del Project Engine.</p>
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
