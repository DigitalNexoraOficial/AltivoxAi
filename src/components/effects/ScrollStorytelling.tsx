"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  "home",
  "services",
  "ofertas",
  "auditoria",
  "casestudies",
  "calculator",
  "simulator",
  "contact",
];

export function ScrollStorytelling() {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState("home");

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      setProgress(Math.min(window.scrollY / max, 1));
      let current = "home";
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= window.innerHeight * 0.35) current = id;
      }
      setActive(current);
      document.documentElement.style.setProperty("--scroll-progress", String(window.scrollY / max));
      document.documentElement.dataset.section = current;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed left-4 top-1/2 z-[80] hidden -translate-y-1/2 flex-col gap-2 lg:flex" aria-hidden>
      {SECTIONS.map((id) => (
        <span
          key={id}
          className={`h-1.5 w-1.5 rounded-full transition ${active === id ? "scale-150 bg-cyan" : "bg-white/25"}`}
        />
      ))}
      <div className="mt-4 h-24 w-[2px] overflow-hidden rounded bg-white/10">
        <div className="w-full bg-cyan transition-[height] duration-200" style={{ height: `${progress * 100}%` }} />
      </div>
    </div>
  );
}
