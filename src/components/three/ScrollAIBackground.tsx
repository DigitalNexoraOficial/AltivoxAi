"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ScrollAIScene = dynamic(() => import("@/components/three/ScrollAIScene"), {
  ssr: false,
  loading: () => null,
});

export function ScrollAIBackground() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const start = () => setEnabled(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 1600 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(start, 450);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.12),transparent_42%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.1),transparent_45%)]" />
      {enabled ? (
        <div className="absolute inset-0 opacity-[0.78]">
          <ScrollAIScene />
        </div>
      ) : (
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan/15 blur-[90px]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/25 to-[#050505]/85" />
    </div>
  );
}
