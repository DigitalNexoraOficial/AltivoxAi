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
        serviceType: serviceType.trim(),
      });
      setName("");
      setNotice(`Creado ${project.name}`);
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
        Fuente de verdad: Project Engine (APIs <span className="ops-mono">/api/ops/projects</span>).
      </p>

      {error ? <div className="ops-error">{error}</div> : null}
      {notice ? <p className="ops-ok">{notice}</p> : null}

      {can("project.create") ? (
        <div className="ops-panel">
          <h2>Nuevo proyecto</h2>
          <form className="ops-form" onSubmit={(e) => void onCreate(e)}>
            <div className="ops-form-row">
              <label htmlFor="proj-name">Nombre</label>
              <input
                id="proj-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={200}
              />
            </div>
            <div className="ops-form-row">
              <label htmlFor="proj-service">service_type</label>
              <input
                id="proj-service"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                required
                maxLength={100}
              />
            </div>
            <div className="ops-form-actions">
              <button className="ops-btn" type="submit" disabled={creating}>
                {creating ? "Creando…" : "Crear"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <p className="ops-callout">
          Sin <span className="ops-mono">project.create</span> en sesión — el
          formulario de alta no se muestra. El servidor es la autoridad.
        </p>
      )}

      <div className="ops-panel">
        <h2>Listado</h2>
        {loading ? (
          <p className="ops-muted">Cargando…</p>
        ) : projects.length === 0 ? (
          <p className="ops-muted">No hay proyectos.</p>
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
