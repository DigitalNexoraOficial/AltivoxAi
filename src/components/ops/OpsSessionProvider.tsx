"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  clearOpsSession,
  fetchOpsSession,
  hasPermission,
  type OpsUser,
} from "@/lib/ops-api";

type OpsSessionState = {
  user: OpsUser | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  can: (action: string) => boolean;
};

const OpsSessionContext = createContext<OpsSessionState | null>(null);

export function OpsSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<OpsUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const u = await fetchOpsSession();
      setUser(u);
    } catch (e) {
      setUser(null);
      setError(e instanceof Error ? e.message : "session_error");
      if (typeof window !== "undefined") {
        const next = encodeURIComponent(
          window.location.pathname + window.location.search
        );
        window.location.href = `/login.html?next=${next}&error=auth_required`;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await clearOpsSession();
    } catch {
      /* cookie clear best-effort */
    }
    window.location.href = "/login.html";
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const can = useCallback(
    (action: string) => hasPermission(user, action),
    [user]
  );

  return (
    <OpsSessionContext.Provider
      value={{ user, loading, error, refresh, logout, can }}
    >
      {children}
    </OpsSessionContext.Provider>
  );
}

export function useOpsSession(): OpsSessionState {
  const ctx = useContext(OpsSessionContext);
  if (!ctx) {
    throw new Error("useOpsSession must be used within OpsSessionProvider");
  }
  return ctx;
}
