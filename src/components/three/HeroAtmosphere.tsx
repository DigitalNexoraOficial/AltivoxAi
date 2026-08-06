"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
  loading: () => null,
});

export function HeroAtmosphere() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    if (reduce || !desktop) return;

    const start = () => setEnabled(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 1800 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(start, 600);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-hero-mesh" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_34%,rgba(34,211,238,0.23),transparent_34%),radial-gradient(circle_at_30%_18%,rgba(168,85,247,0.17),transparent_40%)]" />
      <div className="absolute -left-24 top-24 h-72 w-72 animate-pulse-soft rounded-full bg-cyan/20 blur-[100px]" />
      <div className="absolute -right-16 top-10 h-80 w-80 animate-float rounded-full bg-violet/15 blur-[110px]" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-deep/10 blur-[90px]" />
      <div className="hero-lightbeam absolute -right-16 top-[-10%] h-[130%] w-[52vw]" />
      <div className="hero-lightbeam hero-lightbeam-alt absolute -left-40 top-[6%] h-[110%] w-[38vw]" />
      {enabled ? (
        <div className="absolute inset-0 opacity-[0.88]">
          <HeroScene />
        </div>
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/15 to-ink" />
    </div>
  );
}
