"use client";

import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / 1200, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active]);
  return value;
}

export function AnimatedMetric({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const n = useCountUp(value, active);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="rounded-2xl border border-white/10 bg-black/35 p-4">
      <p className="text-3xl font-semibold text-cyan">
        {n}
        {suffix}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-widest text-mist-muted">{label}</p>
    </div>
  );
}
