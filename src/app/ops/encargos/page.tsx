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

const DEFAULT_SERVICES: OpsEncargoService[] = [
  {
    key: "web",
    label: "Página web / landing",
    hint: "Sitio o landing funcional según brief",
  },
  {
    key: "chatbot",
    label: "Chatbot",
    hint: "Asistente conversacional",
  },
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
  switch (role) {
    case "reasoning":
      return "Razonamiento";
    case "design":
      return "Diseño";
    case "code":
      return "Código";
    case "qa":
      return "QA";
    default:
      return role;
  }
}

export default function OpsEncargosPage() {
  const { can, loading: sessionLoading } = useOpsSession();
  const [clients, setClients] = useState<OpsClient[]>([]);
  const [leads, setLeads] = useState<OpsLead[]>([]);
  const [services, setServices] = useState<OpsEncargoService[]>(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState("");
  const [serviceKey, setServiceKey] = useState("");
  const [detectedService, setDetectedService] = useState("");
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState<"wizard" | "console">("wizard");
  const [view, setView] = useState<OpsEncargoView | null>(null);
  const [consoleLog, setConsoleLog] = useState<string[]>([]);

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId) || null,
    [clients, selectedClientId]
  );

  const linkedLead = useMemo(() => {
    if (!selectedClient?.leadId) {
      // soft match by email
      if (!selectedClient?.email) return null;
      return (
        leads.find(
          (l) =>
            l.email &&
            l.email.toLowerCase() === selectedClient.email.toLowerCase()
        ) || null
      );
    }
    return leads.find((l) => l.id === selectedClient.leadId) || null;
  }, [selectedClient, leads]);

  const canContinue = Boolean(
    selectedClientId &&
      serviceKey &&
      description.trim().length >= 8 &&
      !busy
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, l] = await Promise.all([listClients(), listLeads()]);
      setClients(c);
      setLeads(l);
      setServices(DEFAULT_SERVICES);
    } catch (e) {
      if (e instanceof OpsApiError) {
        setError(`${e.code}: ${e.message}`);
      } else {
        setError("No se pudo cargar clientes/leads");
      }
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
    const fromNotas = selectedClient.notas || "";
    const fromLead = linkedLead
      ? `${linkedLead.tipoInteres} ${linkedLead.mensaje}`
      : "";
    const guess = guessServiceKey(`${fromNotas} ${fromLead}`);
    setDetectedService(guess);
    if (guess && !serviceKey) setServiceKey(guess);
    if (!description.trim()) {
      const msg =
        linkedLead?.mensaje?.trim() ||
        selectedClient.notas?.trim() ||
        "";
      if (msg) setDescription(msg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when client changes
  }, [selectedClientId, linkedLead?.id]);

  function appendLog(line: string) {
    setConsoleLog((prev) => [...prev, line]);
  }

  function syncView(next: OpsEncargoView) {
    setView(next);
    const lines: string[] = [
      `Encargo ${next.encargo.id}`,
      `Cliente: ${next.encargo.clientName}`,
      `Servicio: ${next.encargo.serviceLabel} (${next.encargo.serviceKey})`,
      `Estado: ${next.encargo.status}`,
      next.encargo.projectId
        ? `Proyecto PE: ${next.encargo.projectId}`
        : "Proyecto PE: (pendiente)",
      "———",
    ];
    for (const s of next.steps) {
      lines.push(`▸ [${s.role}] ${s.agentId} · ${s.status}`);
      if (s.proposal) {
        lines.push(`PROPUESTA (requiere tu OK):\n${s.proposal}`);
      }
      if (s.output) {
        lines.push(`SALIDA:\n${s.output}`);
      }
      lines.push("———");
    }
    setConsoleLog(lines);
  }

  async function onContinue() {
    if (!canContinue || !selectedClient) return;
    setBusy(true);
    setError(null);
    try {
      appendLog("Creando encargo…");
      const created = await createEncargo({
        clientId: selectedClient.id,
        clientName: selectedClient.nombre,
        leadId: linkedLead?.id || selectedClient.leadId,
        serviceKey,
        description: description.trim(),
      });
      appendLog("Encargo creado. Arrancando orquestación (propuesta del primer agente)…");
      const continued = await continueEncargo(created.encargo.id);
      syncView(continued);
      setPhase("console");
    } catch (e) {
      if (e instanceof OpsApiError) {
        setError(`${e.code}: ${e.message}`);
      } else {
        setError("No se pudo continuar el encargo");
      }
    } finally {
      setBusy(false);
    }
  }

  async function onApprove(stepId: string) {
    if (!view) return;
    setBusy(true);
    setError(null);
    try {
      appendLog(`OK humano → aprobando paso ${stepId}…`);
      const next = await approveEncargoStep(view.encargo.id, stepId);
      syncView(next);
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
      appendLog(`Rechazo humano → paso ${stepId}`);
      const next = await rejectEncargoStep(view.encargo.id, stepId);
      syncView(next);
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
      const next = await proposeEncargoStep(view.encargo.id, stepId);
      syncView(next);
    } catch (e) {
      if (e instanceof OpsApiError) setError(`${e.code}: ${e.message}`);
      else setError("Error al re-proponer");
    } finally {
      setBusy(false);
    }
  }

  if (sessionLoading || loading) {
    return <p className="ops-muted">Cargando encargos…</p>;
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
        Selecciona cliente → servicio → descripción → Continuar. Los agentes
        solo proponen; <strong>nada se implementa sin tu OK</strong>.
      </p>

      {error ? <div className="ops-error">{error}</div> : null}

      <ul className="ops-wizard-steps" aria-label="Fases">
        <li className={phase === "wizard" ? "is-active" : "is-done"}>
          1 · Brief
        </li>
        <li className={phase === "console" ? "is-active" : ""}>
          2 · Orquestación
        </li>
      </ul>

      {phase === "wizard" ? (
        <div className="ops-stack">
          <section className="ops-panel">
            <h2>1 · Cliente</h2>
            <p className="ops-help">
              Clientes con ID en CRM. Al seleccionar, se intenta detectar el
              servicio y rellenar la descripción desde el lead vinculado o
              notas.
            </p>
            {clients.length === 0 ? (
              <p className="ops-muted">
                No hay clientes. Crea uno en Clientes (legacy) o vía CRM y
                recarga.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Empresa</th>
                      <th>Email</th>
                      <th>Origen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((c) => (
                      <tr
                        key={c.id}
                        className={
                          selectedClientId === c.id ? "is-selected" : ""
                        }
                        onClick={() => setSelectedClientId(c.id)}
                      >
                        <td>
                          <strong>{c.nombre}</strong>
                          <div className="ops-mono">{c.id}</div>
                        </td>
                        <td>{c.empresa || "—"}</td>
                        <td className="ops-mono">{c.email || "—"}</td>
                        <td>{c.origen || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="ops-panel">
            <h2>2 · Servicio</h2>
            {selectedClient ? (
              <>
                <p className="ops-help">
                  Cliente: <strong>{selectedClient.nombre}</strong>
                  {detectedService ? (
                    <>
                      {" "}
                      · Detectado:{" "}
                      <span className="ops-mono">{detectedService}</span>
                    </>
                  ) : (
                    " · Sin detección automática — elige abajo"
                  )}
                </p>
                <div className="ops-form-row">
                  <label htmlFor="enc-service">Servicio a entregar</label>
                  <select
                    id="enc-service"
                    value={serviceKey}
                    onChange={(e) => setServiceKey(e.target.value)}
                    disabled={busy}
                  >
                    <option value="">Seleccionar…</option>
                    {services.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <p className="ops-field-hint">
                    {services.find((s) => s.key === serviceKey)?.hint ||
                      "Elige el servicio que vamos a realizar."}
                  </p>
                </div>
              </>
            ) : (
              <p className="ops-muted">Selecciona un cliente primero.</p>
            )}
          </section>

          <section className="ops-panel">
            <h2>3 · Descripción / comentario</h2>
            <p className="ops-help">
              Brief del cliente (lead, chat, email) o el que escribas tú. Mínimo
              8 caracteres.
            </p>
            <div className="ops-form-row">
              <label htmlFor="enc-desc">Descripción del encargo</label>
              <textarea
                id="enc-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={busy || !selectedClientId}
                rows={6}
                placeholder="Qué necesita el cliente, tono, secciones, plazos…"
              />
              {linkedLead ? (
                <p className="ops-field-hint">
                  Lead vinculado: {linkedLead.tipoInteres || "sin tipo"} ·{" "}
                  {linkedLead.fuente || "fuente?"}
                </p>
              ) : null}
            </div>
          </section>

          <section className="ops-panel">
            <h2>4 · Continuar</h2>
            <p className="ops-help">
              El botón verde solo se activa con cliente + servicio +
              descripción válidos. Luego verás la consola de agentes; cada paso
              espera tu aprobación.
            </p>
            <div className="ops-form-actions">
              <button
                type="button"
                className="ops-btn ops-btn-go"
                disabled={!canContinue || !can("project.create")}
                onClick={() => void onContinue()}
              >
                {busy ? "Procesando…" : "Continuar"}
              </button>
            </div>
            {!can("project.create") ? (
              <p className="ops-muted">Sin permiso project.create</p>
            ) : null}
          </section>
        </div>
      ) : (
        <div className="ops-stack">
          <section className="ops-panel">
            <h2>Orquestación · consola</h2>
            <p className="ops-help">
              Jarvis/tú orquestáis. Los agentes proponen; al pulsar{" "}
              <strong>Aprobar</strong> implementan. <strong>Rechazar</strong>{" "}
              bloquea ese paso hasta nueva propuesta.
            </p>
            <pre className="ops-console" aria-live="polite">
              {consoleLog.join("\n\n") || "Sin actividad aún."}
            </pre>
            <div className="ops-form-actions" style={{ marginTop: "0.75rem" }}>
              <button
                type="button"
                className="ops-btn ops-btn-ghost"
                disabled={busy}
                onClick={() => {
                  setPhase("wizard");
                  setView(null);
                  setConsoleLog([]);
                }}
              >
                Nuevo encargo
              </button>
            </div>
          </section>

          <section className="ops-panel">
            <h2>Pasos de agentes</h2>
            {!view?.steps.length ? (
              <p className="ops-muted">Sin pasos.</p>
            ) : (
              view.steps.map((s) => (
                <div
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
                  <div className="ops-mono">{s.agentId}</div>
                  {s.proposal ? (
                    <p className="ops-help" style={{ marginTop: "0.5rem" }}>
                      {s.proposal.slice(0, 600)}
                      {s.proposal.length > 600 ? "…" : ""}
                    </p>
                  ) : null}
                  <div className="ops-form-actions">
                    {s.status === "proposed" ? (
                      <>
                        <button
                          type="button"
                          className="ops-btn ops-btn-go"
                          disabled={busy || !can("agent.execute")}
                          onClick={() => void onApprove(s.id)}
                        >
                          Aprobar e implementar
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
                </div>
              ))
            )}
          </section>
        </div>
      )}
    </>
  );
}
