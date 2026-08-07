"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { OpsBreadcrumbs } from "@/components/ops/OpsBreadcrumbs";
import { useOpsSession } from "@/components/ops/OpsSessionProvider";
import {
  createProject,
  listProjects,
  OpsApiError,
  OPS_SERVICE_TYPE_HINTS,
  type OpsProject,
} from "@/lib/ops-api";

export default function OpsProjectsPage() {
  const { can, loading: sessionLoading } = useOpsSession();
  const [projects, setProjects] = useState<OpsProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [serviceType, setServiceType] = useState("web");
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listProjects();
      setProjects(rows);
    } catch (e) {
      if (e instanceof OpsApiError) {
        setError(
          e.status === 403
            ? "403 — sin permiso project.read"
            : `${e.code}: ${e.message}`
        );
      } else {
        setError("No se pudo cargar proyectos");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!sessionLoading) void load();
  }, [sessionLoading, load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setNotice(null);
    setError(null);
    setCreating(true);
    try {
      const project = await createProject({
        name: name.trim(),
        serviceType: serviceType.trim() || "web",
      });
      setName("");
      setNotice(`Creado «${project.name}» — abre el detalle para seguir el flujo.`);
      await load();
    } catch (err) {
      if (err instanceof OpsApiError) {
        setError(
          err.status === 403
            ? "403 — sin permiso project.create"
            : `${err.code}: ${err.message}`
        );
      } else {
        setError("Error al crear");
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/ops", label: "Ops" },
          { label: "Proyectos" },
        ]}
      />
      <h1 className="ops-page-title">Proyectos</h1>
      <p className="ops-lede">
        Cada proyecto sigue: datos → versión → entregable → review cliente →
        deploy. Entra al detalle para el asistente paso a paso.
      </p>

      {error ? <div className="ops-error">{error}</div> : null}
      {notice ? <p className="ops-ok">{notice}</p> : null}

      {can("project.create") ? (
        <div className="ops-panel">
          <h2>Nuevo proyecto</h2>
          <p className="ops-help">
            Empieza con un nombre claro. El tipo de servicio es una etiqueta
            (recomendado <span className="ops-mono">web</span>).
          </p>
          <form className="ops-form" onSubmit={(e) => void onCreate(e)}>
            <div className="ops-form-row">
              <label htmlFor="proj-name">Nombre</label>
              <input
                id="proj-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={200}
                placeholder="Ej. Web Clínica Sol"
              />
            </div>
            <div className="ops-form-row">
              <label htmlFor="proj-service">Tipo de servicio</label>
              <input
                id="proj-service"
                list="proj-service-hints"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                required
                maxLength={100}
              />
              <datalist id="proj-service-hints">
                {OPS_SERVICE_TYPE_HINTS.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </datalist>
              <p className="ops-field-hint">
                Chatbot / automation no se generan solos — solo clasifican el
                proyecto.
              </p>
            </div>
            <div className="ops-form-actions">
              <button className="ops-btn" type="submit" disabled={creating}>
                {creating ? "Creando…" : "Crear proyecto"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <p className="ops-callout">
          Sin <span className="ops-mono">project.create</span> — no puedes
          crear proyectos con esta sesión.
        </p>
      )}

      <div className="ops-panel">
        <h2>Listado</h2>
        {loading ? (
          <p className="ops-muted">Cargando…</p>
        ) : projects.length === 0 ? (
          <p className="ops-muted">No hay proyectos. Crea el primero arriba.</p>
        ) : (
          <table className="ops-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Servicio</th>
                <th>Estado</th>
                <th>Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/ops/projects/${p.id}`}>{p.name}</Link>
                  </td>
                  <td className="ops-mono">{p.serviceType}</td>
                  <td>
                    <span className="ops-status">{p.status}</span>
                  </td>
                  <td className="ops-mono">
                    {new Date(p.updatedAt).toLocaleString("es-ES")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
