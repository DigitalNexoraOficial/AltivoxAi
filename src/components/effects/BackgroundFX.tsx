"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";

export function BackgroundFX() {
  const root = useRef<HTMLDivElement>(null);
  const particles = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 2 + Math.random() * 5,
      })),
    []
  );

  useEffect(() => {
    if (!root.current) return;
    const q = gsap.utils.selector(root);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    gsap.to(q(".fx-orb"), {
      yPercent: -8,
      xPercent: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      duration: 8,
      stagger: 1.2,
    });

    gsap.to(q(".fx-dot"), {
      opacity: 0.18,
      scale: 0.65,
      repeat: -1,
      yoyo: true,
      duration: 2.8,
      ease: "sine.inOut",
      stagger: 0.06,
    });
  }, []);

  return (
    <div ref={root} className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="fx-orb absolute -left-24 top-24 h-96 w-96 rounded-full bg-cyan/20 blur-[120px]" />
      <div className="fx-orb absolute -right-20 top-16 h-[28rem] w-[28rem] rounded-full bg-violet/20 blur-[140px]" />
      <div className="fx-orb absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-deep/15 blur-[120px]" />
      {particles.map((p) => (
        <span
          key={p.id}
          className="fx-dot absolute rounded-full bg-cyan/70"
          style={{ left: p.left, top: p.top, width: `${p.size}px`, height: `${p.size}px`, opacity: 0.42 }}
        />
      ))}
    </div>
  );
}
