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
        Shell operativo de Altivox OS. Proyectos viven en el Project Engine;
        CRM y ajustes siguen en HTML temporal (ADR-001) hasta su migración.
      </p>

      <div className="ops-grid-cards">
        <Link href="/ops/projects" className="ops-card-link">
          <h3>Proyectos</h3>
          <p>
            Listado, detalle, transiciones, versiones, entregables y timeline
            vía APIs del Bloque 2.
          </p>
        </Link>
        <Link href="/ops/encargos" className="ops-card-link">
          <h3>Encargos</h3>
          <p>
            Wizard cliente → servicio → brief → agentes con OK humano obligatorio.
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
            Autenticado como <span className="ops-mono">{user.email || user.id}</span>
            {" · "}
            rol <span className="ops-mono">{user.role}</span>
            {" · "}
            {can("project.read") ? "puede leer proyectos" : "sin project.read"}
          </p>
        ) : (
          <p className="ops-muted">Cargando sesión…</p>
        )}
        <p className="ops-callout" style={{ marginTop: "0.75rem" }}>
          La UI no aplica RBAC: solo el servidor autoriza con{" "}
          <span className="ops-mono">can(subject, action, resource)</span>. Los
          permisos de sesión se usan únicamente para ocultar acciones
          claramente denegadas.
        </p>
      </div>
    </>
  );
}
