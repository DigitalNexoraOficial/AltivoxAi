"use client";

import { OpsHeader } from "./OpsHeader";
import { OpsSidebar } from "./OpsSidebar";
import { OpsSessionProvider } from "./OpsSessionProvider";

export function OpsShell({ children }: { children: React.ReactNode }) {
  return (
    <OpsSessionProvider>
      <div className="ops-root">
        <OpsSidebar />
        <div className="ops-main">
          <OpsHeader />
          <div className="ops-content">{children}</div>
        </div>
      </div>
    </OpsSessionProvider>
  );
}
