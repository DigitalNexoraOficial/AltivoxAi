"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { OpsBreadcrumbs } from "@/components/ops/OpsBreadcrumbs";
import { useOpsSession } from "@/components/ops/OpsSessionProvider";
import {
  approveEncargoStep,
  continueEncargo,
  createEncargo,
  getEncargo,
  listClients,
  listEncargos,
  listLeads,
  OpsApiError,
  proposeEncargoStep,
  rejectEncargoStep,
  type OpsClient,
  type OpsEncargo,
  type OpsEncargoService,
  type OpsEncargoView,
  type OpsLead,
} from "@/lib/ops-api";

const SERVICES: OpsEncargoService[] = [
  { key: "web", label: "Web / landing", hint: "Página o sitio según el brief" },
  { key: "chatbot", label: "Chatbot", hint: "Asistente conversacional" },
  {
    key: "automation",
    label: "Automatización",
    hint: "Flujos e integraciones",
  },
];

const STATUS_ES: Record<string, string> = {
  draft: "Borrador",
  ready: "Listo",
  awaiting_approval: "Esperando tu OK",
  running: "Ejecutando",
  completed: "Completado",
  cancelled: "Cancelado",
  pending: "Pendiente",
  proposed: "Propuesta lista",
  approved: "Aprobado",
  done: "Hecho",
  rejected: "Rechazado",
  failed: "Falló",
};

function guessServiceKey(text: string): string {
  const t = text.toLowerCase();
  if (/chat|bot|whatsapp|asistente/.test(t)) return "chatbot";
  if (/automat|n8n|workflow|integraci/.test(t)) return "automation";
  if (/web|landing|p[aá]gina|sitio|tienda/.test(t)) return "web";
  return "";
}

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    reasoning: "1 · Razonamiento",
    design: "2 · Diseño",
    code: "3 · Código",
    qa: "4 · QA",
  };
  return map[role] || role;
}

function statusLabel(s: string): string {
  return STATUS_ES[s] || s;
}

function readQueryId(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("id") || "";
}

function writeQueryId(id: string | null) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (id) url.searchParams.set("id", id);
  else url.searchParams.delete("id");
  window.history.replaceState({}, "", url.pathname + url.search);
}

export default function OpsEncargosPage() {
  const { can, loading: sessionLoading } = useOpsSession();
  const [clients, setClients] = useState<OpsClient[]>([]);
  const [leads, setLeads] = useState<OpsLead[]>([]);
  const [recent, setRecent] = useState<OpsEncargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState("");
  const [serviceKey, setServiceKey] = useState("");
  const [detectedService, setDetectedService] = useState("");
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState<"brief" | "run">("brief");
  const [view, setView] = useState<OpsEncargoView | null>(null);
  const [filter, setFilter] = useState("");

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId) || null,
    [clients, selectedClientId]
  );

  const linkedLead = useMemo(() => {
    if (!selectedClient) return null;
    if (selectedClient.leadId) {
      return leads.find((l) => l.id === selectedClient.leadId) || null;
    }
    if (!selectedClient.email) return null;
    return (
      leads.find(
        (l) =>
          l.email &&
          l.email.toLowerCase() === selectedClient.email.toLowerCase()
      ) || null
    );
  }, [selectedClient, leads]);

  const filteredClients = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      `${c.nombre} ${c.empresa} ${c.email}`.toLowerCase().includes(q)
    );
  }, [clients, filter]);

  const canContinue = Boolean(
    selectedClientId && serviceKey && description.trim().length >= 8 && !busy
  );

  function syncView(next: OpsEncargoView) {
    setView(next);
    setPhase("run");
    writeQueryId(next.encargo.id);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resumeId = readQueryId();
      const [c, l, listed] = await Promise.all([
        listClients(),
        listLeads(),
        listEncargos().catch(() => ({ encargos: [] as OpsEncargo[] })),
      ]);
      setClients(c);
      setLeads(l);
      setRecent(listed.encargos.slice(0, 8));

      if (resumeId) {
        try {
          syncView(await getEncargo(resumeId));
        } catch (e) {
          writeQueryId(null);
          if (e instanceof OpsApiError) {
            setError(`No se pudo reabrir el encargo: ${e.message}`);
          }
        }
      }
    } catch (e) {
      if (e instanceof OpsApiError) setError(`${e.code}: ${e.message}`);
      else setError("No se pudo cargar clientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!sessionLoading) void load();
  }, [sessionLoading, load]);

  useEffect(() => {
    if (!selectedClient) {
      setDetectedService("");
      return;
    }
    const fromLead = linkedLead
      ? `${linkedLead.tipoInteres} ${linkedLead.mensaje}`
      : "";
    const guess = guessServiceKey(`${selectedClient.notas} ${fromLead}`);
    setDetectedService(guess);
    if (guess) setServiceKey(guess);
    const msg =
      linkedLead?.mensaje?.trim() || selectedClient.notas?.trim() || "";
    if (msg) setDescription(msg);
  }, [selectedClientId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onContinue() {
    if (!canContinue || !selectedClient) return;
    setBusy(true);
    setError(null);
    try {
      const created = await createEncargo({
        clientId: selectedClient.id,
        clientName: selectedClient.nombre,
        leadId: linkedLead?.id || selectedClient.leadId,
        serviceKey,
        description: description.trim(),
      });
      const continued = await continueEncargo(created.encargo.id);
      syncView(continued);
    } catch (e) {
      if (e instanceof OpsApiError) setError(`${e.code}: ${e.message}`);
      else setError("No se pudo iniciar el encargo");
    } finally {
      setBusy(false);
    }
  }

  async function onApprove(stepId: string) {
    if (!view) return;
    setBusy(true);
    setError(null);
    try {
      syncView(await approveEncargoStep(view.encargo.id, stepId));
    } catch (e) {
      if (e instanceof OpsApiError) setError(`${e.code}: ${e.message}`);
      else setError("Error al aprobar");
      try {
        syncView(await getEncargo(view.encargo.id));
      } catch {
        /* ignore */
      }
    } finally {
      setBusy(false);
    }
  }

  async function onReject(stepId: string) {
    if (!view) return;
    setBusy(true);
    setError(null);
    try {
      syncView(await rejectEncargoStep(view.encargo.id, stepId));
    } catch (e) {
      if (e instanceof OpsApiError) setError(`${e.code}: ${e.message}`);
      else setError("Error al rechazar");
    } finally {
      setBusy(false);
    }
  }

  async function onRepropose(stepId: string) {
    if (!view) return;
    setBusy(true);
    setError(null);
    try {
      syncView(await proposeEncargoStep(view.encargo.id, stepId));
    } catch (e) {
      if (e instanceof OpsApiError) setError(`${e.code}: ${e.message}`);
      else setError("Error al re-proponer");
    } finally {
      setBusy(false);
    }
  }

  async function openRecent(id: string) {
    setBusy(true);
    setError(null);
    try {
      syncView(await getEncargo(id));
    } catch (e) {
      if (e instanceof OpsApiError) setError(`${e.code}: ${e.message}`);
      else setError("No se pudo abrir el encargo");
    } finally {
      setBusy(false);
    }
  }

  if (sessionLoading) {
    return (
      <>
        <h1 className="ops-page-title">Encargos</h1>
        <p className="ops-muted">Comprobando sesión…</p>
      </>
    );
  }

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/ops", label: "Ops" },
          { label: "Encargos" },
        ]}
      />
      <h1 className="ops-page-title">Encargos</h1>
      <p className="ops-lede">
        Cliente → servicio → brief. Los agentes proponen; nada se implementa
        sin tu OK.
      </p>

      {error ? <div className="ops-error">{error}</div> : null}
      {loading ? <p className="ops-muted">Cargando clientes…</p> : null}

      <ul className="ops-wizard-steps">
        <li className={phase === "brief" ? "is-active" : "is-done"}>Brief</li>
        <li className={phase === "run" ? "is-active" : ""}>Agentes</li>
      </ul>

      {phase === "brief" && !loading ? (
        <div className="ops-stack">
          {recent.length > 0 ? (
            <section className="ops-panel">
              <h2>Recientes</h2>
              <ul className="ops-recent-list">
                {recent.map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      className="ops-btn ops-btn-ghost"
                      disabled={busy}
                      onClick={() => void openRecent(e.id)}
                    >
                      {e.clientName} · {e.serviceLabel} · {statusLabel(e.status)}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="ops-panel">
            <h2>Nuevo encargo</h2>

            <div className="ops-form-row">
              <label htmlFor="enc-search">Cliente</label>
              <input
                id="enc-search"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Buscar por nombre, empresa o email"
              />
            </div>

            {filteredClients.length === 0 ? (
              <p className="ops-muted">
                No hay clientes. Créalos en Clientes y vuelve aquí.
              </p>
            ) : (
              <div className="ops-table-wrap">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Empresa</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((c) => (
                      <tr
                        key={c.id}
                        className={
                          selectedClientId === c.id ? "is-selected" : ""
                        }
                        onClick={() => setSelectedClientId(c.id)}
                      >
                        <td>
                          <strong>{c.nombre}</strong>
                        </td>
                        <td>{c.empresa || "—"}</td>
                        <td className="ops-mono">{c.email || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="ops-form-row" style={{ marginTop: "1rem" }}>
              <label htmlFor="enc-service">Servicio</label>
              <select
                id="enc-service"
                value={serviceKey}
                onChange={(e) => setServiceKey(e.target.value)}
                disabled={busy || !selectedClientId}
              >
                <option value="">
                  {selectedClientId
                    ? "Seleccionar…"
                    : "Elige un cliente antes"}
                </option>
                {SERVICES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
              {selectedClient && detectedService ? (
                <p className="ops-field-hint">
                  Sugerido por el lead/notas: {detectedService}
                </p>
              ) : null}
            </div>

            <div className="ops-form-row">
              <label htmlFor="enc-desc">Qué hay que hacer</label>
              <textarea
                id="enc-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={busy || !selectedClientId}
                rows={5}
                maxLength={8000}
                placeholder="Brief del cliente o el tuyo: objetivo, estilo, secciones…"
              />
            </div>

            <div className="ops-form-actions">
              <button
                type="button"
                className="ops-btn ops-btn-go"
                disabled={!canContinue || !can("project.create")}
                onClick={() => void onContinue()}
              >
                {busy ? "Iniciando…" : "Continuar"}
              </button>
            </div>
            {!can("project.create") ? (
              <p className="ops-field-hint">
                Tu rol no tiene project.create — no puedes iniciar encargos.
              </p>
            ) : !canContinue && selectedClientId ? (
              <p className="ops-field-hint">
                Elige servicio y escribe al menos 8 caracteres en el brief.
              </p>
            ) : null}
          </section>
        </div>
      ) : null}

      {phase === "run" && view ? (
        <div className="ops-stack">
          <section className="ops-panel">
            <h2>
              {view.encargo.clientName} · {view.encargo.serviceLabel}
            </h2>
            <p className="ops-help">
              Estado:{" "}
              <span className="ops-status">
                {statusLabel(view.encargo.status)}
              </span>
              {view.encargo.projectId ? (
                <>
                  {" "}
                  ·{" "}
                  <Link
                    href={`/ops/projects/${view.encargo.projectId}`}
                    className="ops-inline-link"
                  >
                    Abrir proyecto
                  </Link>
                </>
              ) : null}
            </p>
            <p className="ops-callout">
              Revisa cada propuesta. Solo <strong>Aprobar</strong> ejecuta al
              agente. <strong>Rechazar</strong> pide otra propuesta.
            </p>
            <div className="ops-form-actions" style={{ marginTop: "0.75rem" }}>
              <button
                type="button"
                className="ops-btn ops-btn-ghost"
                disabled={busy}
                onClick={() => {
                  setPhase("brief");
                  setView(null);
                  writeQueryId(null);
                }}
              >
                ← Nuevo encargo
              </button>
            </div>
          </section>

          {view.steps.map((s) => (
            <section
              key={s.id}
              className={
                "ops-step-card" +
                (s.status === "proposed"
                  ? " is-proposed"
                  : s.status === "done"
                    ? " is-done"
                    : "")
              }
            >
              <div className="ops-step-head">
                <strong>{roleLabel(s.role)}</strong>
                <span className="ops-status">{statusLabel(s.status)}</span>
              </div>
              {s.proposal ? (
                <pre className="ops-console" style={{ marginTop: "0.65rem" }}>
                  {s.proposal}
                </pre>
              ) : null}
              {s.output ? (
                <pre className="ops-console" style={{ marginTop: "0.65rem" }}>
                  {s.output}
                </pre>
              ) : null}
              <div className="ops-form-actions" style={{ marginTop: "0.65rem" }}>
                {s.status === "proposed" ? (
                  <>
                    <button
                      type="button"
                      className="ops-btn ops-btn-primary"
                      disabled={busy || !can("agent.execute")}
                      onClick={() => void onApprove(s.id)}
                    >
                      {busy ? "Trabajando…" : "Aprobar"}
                    </button>
                    <button
                      type="button"
                      className="ops-btn ops-btn-danger"
                      disabled={busy}
                      onClick={() => void onReject(s.id)}
                    >
                      Rechazar
                    </button>
                  </>
                ) : null}
                {s.status === "rejected" || s.status === "failed" ? (
                  <button
                    type="button"
                    className="ops-btn"
                    disabled={busy}
                    onClick={() => void onRepropose(s.id)}
                  >
                    Nueva propuesta
                  </button>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </>
  );
}
