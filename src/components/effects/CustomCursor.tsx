"use client";

import { useEffect, useState } from "react";

export function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const onMove = (e: PointerEvent) => setPos({ x: e.clientX, y: e.clientY });
    const onOver = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      setActive(Boolean(t?.closest("a,button,.ui-lift,.cursor-grow")));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      className={`pointer-events-none fixed left-0 top-0 z-[200] hidden mix-blend-difference lg:block ${active ? "scale-150" : "scale-100"}`}
      style={{ transform: `translate3d(${pos.x - 10}px, ${pos.y - 10}px, 0)` }}
      aria-hidden
    >
      <span className="block h-5 w-5 rounded-full border border-white bg-white/20 transition-transform duration-200" />
    </div>
  );
}
