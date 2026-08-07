"use client";

import { useOpsSession } from "./OpsSessionProvider";

export function OpsHeader() {
  const { user, loading, logout } = useOpsSession();

  return (
    <header className="ops-header">
      <div className="ops-header-title">
        <span className="ops-eyebrow">Altivox OS</span>
        <strong>Ops</strong>
      </div>
      <div className="ops-header-actions">
        {loading ? (
          <span className="ops-muted">Sesión…</span>
        ) : user ? (
          <>
            <span className="ops-user" title={user.id}>
              {user.email || user.id}
              <span className="ops-role">{user.role}</span>
            </span>
            <button type="button" className="ops-btn ops-btn-ghost" onClick={() => void logout()}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <a className="ops-btn" href="/login.html?next=/ops">
            Entrar
          </a>
        )}
      </div>
    </header>
  );
}
