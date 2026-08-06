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
    // Start sooner for perceived quality, still after first paint
    const t = window.setTimeout(start, 120);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden [contain:strict]" aria-hidden>
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(34,211,238,0.14),transparent_40%),radial-gradient(circle_at_82%_72%,rgba(168,85,247,0.12),transparent_44%)]" />
      {enabled ? (
        <div className="absolute inset-0 opacity-[0.9] will-change-transform">
          <ScrollAIScene />
        </div>
      ) : (
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan/20 blur-[100px]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/15 to-[#050505]/72" />
    </div>
  );
}
