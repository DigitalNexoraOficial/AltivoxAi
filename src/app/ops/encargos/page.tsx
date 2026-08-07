"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { OpsBreadcrumbs } from "@/components/ops/OpsBreadcrumbs";
import { useOpsSession } from "@/components/ops/OpsSessionProvider";
import {
  approveEncargoStep,
  continueEncargo,
  createEncargo,
  getEncargo,
  listClients,
  listLeads,
  OpsApiError,
  proposeEncargoStep,
  rejectEncargoStep,
  type OpsClient,
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

export default function OpsEncargosPage() {
  const { can, loading: sessionLoading } = useOpsSession();
  const [clients, setClients] = useState<OpsClient[]>([]);
  const [leads, setLeads] = useState<OpsLead[]>([]);
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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, l] = await Promise.all([listClients(), listLeads()]);
      setClients(c);
      setLeads(l);
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

  function syncView(next: OpsEncargoView) {
    setView(next);
  }

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
      setPhase("run");
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

  if (sessionLoading || loading) {
    return <p className="ops-muted">Cargando Encargos…</p>;
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
        Elige cliente, servicio y brief. Los agentes proponen; tú das el OK
        antes de cada implementación.
      </p>

      {error ? <div className="ops-error">{error}</div> : null}

      <ul className="ops-wizard-steps">
        <li className={phase === "brief" ? "is-active" : "is-done"}>
          Brief
        </li>
        <li className={phase === "run" ? "is-active" : ""}>Agentes</li>
      </ul>

      {phase === "brief" ? (
        <div className="ops-stack">
          <section className="ops-panel">
            <h2>Cliente</h2>
            <div className="ops-form-row">
              <label htmlFor="enc-search">Buscar</label>
              <input
                id="enc-search"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Nombre, empresa o email"
              />
            </div>
            {filteredClients.length === 0 ? (
              <p className="ops-muted">
                No hay clientes. Créalos en Clientes (menú) y vuelve aquí.
              </p>
            ) : (
              <div style={{ overflowX: "auto", marginTop: "0.75rem" }}>
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
          </section>

          <section className="ops-panel">
            <h2>Servicio</h2>
            {!selectedClient ? (
              <p className="ops-muted">Selecciona un cliente arriba.</p>
            ) : (
              <>
                <p className="ops-help">
                  Cliente: <strong>{selectedClient.nombre}</strong>
                  {detectedService
                    ? ` · sugerido: ${detectedService}`
                    : " · elige el servicio"}
                </p>
                <div className="ops-form-row">
                  <label htmlFor="enc-service">Qué vamos a entregar</label>
                  <select
                    id="enc-service"
                    value={serviceKey}
                    onChange={(e) => setServiceKey(e.target.value)}
                    disabled={busy}
                  >
                    <option value="">Seleccionar…</option>
                    {SERVICES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </section>

          <section className="ops-panel">
            <h2>Descripción</h2>
            <p className="ops-help">
              Comentario del cliente (lead/chat) o lo que indiques tú.
            </p>
            <div className="ops-form-row">
              <label htmlFor="enc-desc">Brief</label>
              <textarea
                id="enc-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={busy || !selectedClientId}
                rows={5}
                placeholder="Qué necesita, estilo, secciones, tono…"
              />
            </div>
          </section>

          <section className="ops-panel">
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
            {!canContinue && selectedClientId ? (
              <p className="ops-field-hint">
                Completa servicio y una descripción de al menos 8 caracteres.
              </p>
            ) : null}
          </section>
        </div>
      ) : (
        <div className="ops-stack">
          <section className="ops-panel">
            <h2>
              {view?.encargo.clientName} · {view?.encargo.serviceLabel}
            </h2>
            <p className="ops-help">
              Estado: <span className="ops-status">{view?.encargo.status}</span>
              {view?.encargo.projectId ? (
                <>
                  {" "}
                  · Proyecto{" "}
                  <span className="ops-mono">{view.encargo.projectId}</span>
                </>
              ) : null}
            </p>
            <p className="ops-callout">
              Nada se implementa sin pulsar <strong>Aprobar</strong>. Rechazar
              pide una nueva propuesta.
            </p>
            <div className="ops-form-actions" style={{ marginTop: "0.75rem" }}>
              <button
                type="button"
                className="ops-btn ops-btn-ghost"
                disabled={busy}
                onClick={() => {
                  setPhase("brief");
                  setView(null);
                }}
              >
                ← Nuevo encargo
              </button>
            </div>
          </section>

          {view?.steps.map((s) => (
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
              <strong>
                {roleLabel(s.role)} · {s.status}
              </strong>
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
                      className="ops-btn ops-btn-go"
                      disabled={busy || !can("agent.execute")}
                      onClick={() => void onApprove(s.id)}
                    >
                      Aprobar
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
      )}
    </>
  );
}
