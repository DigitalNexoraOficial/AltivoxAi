"use client";

import Link from "next/link";
import { OpsBreadcrumbs } from "@/components/ops/OpsBreadcrumbs";
import { useOpsSession } from "@/components/ops/OpsSessionProvider";

export default function OpsDashboardPage() {
  const { user, can } = useOpsSession();

  return (
    <>
      <OpsBreadcrumbs items={[{ label: "Ops" }]} />
      <h1 className="ops-page-title">Dashboard</h1>
      <p className="ops-lede">
        Centro de operaciones Altivox OS. El trabajo diario de entrega vive en
        Proyectos (versión → entregable → review → deploy).
      </p>

      <div className="ops-panel">
        <h2>Flujo rápido</h2>
        <ol className="ops-help" style={{ paddingLeft: "1.2rem", margin: 0 }}>
          <li>Crea o abre un proyecto</li>
          <li>Crea una versión (v1) — se genera un UUID</li>
          <li>Registra entregables (Home, Landing…)</li>
          <li>Emite review y envía el enlace /r/… al cliente</li>
          <li>Cuando toque, empaqueta el deploy (ZIP interno)</li>
        </ol>
        <p className="ops-field-hint" style={{ marginTop: "0.75rem" }}>
          Agentes / chatbot automático: el módulo operativo actual es{" "}
          <span className="ops-mono">web</span>. No hay UI de agentes en Ops
          todavía; JARVIS no es un chat aquí.
        </p>
      </div>

      <div className="ops-grid-cards">
        <Link href="/ops/projects" className="ops-card-link">
          <h3>Proyectos</h3>
          <p>
            Asistente paso a paso: datos, versión, entregable, review y deploy.
          </p>
        </Link>
        <a href="/dashboard.html" className="ops-card-link">
          <h3>CRM · legacy</h3>
          <p>Panel HTML temporal. No es App Router.</p>
        </a>
        <a href="/clientes.html" className="ops-card-link">
          <h3>Clientes · legacy</h3>
          <p>Gestión HTML temporal (ADR-001).</p>
        </a>
        <a href="/ajustes.html" className="ops-card-link">
          <h3>Ajustes · legacy</h3>
          <p>Site settings vía panel HTML.</p>
        </a>
      </div>

      <div className="ops-panel" style={{ marginTop: "1.25rem" }}>
        <h2>Sesión</h2>
        {user ? (
          <p className="ops-muted">
            Autenticado como{" "}
            <span className="ops-mono">{user.email || user.id}</span>
            {" · "}
            rol <span className="ops-mono">{user.role}</span>
            {" · "}
            {can("project.read") ? "puede leer proyectos" : "sin project.read"}
          </p>
        ) : (
          <p className="ops-muted">Cargando sesión…</p>
        )}
      </div>
    </>
  );
}
