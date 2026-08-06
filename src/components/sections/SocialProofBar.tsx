"use client";

import { useEffect, useState } from "react";
import { useIndustry } from "@/components/providers/IndustryProvider";

const FEED = [
  { brand: "Retail Norte", text: "Chatbot en producción en 7 días" },
  { brand: "Clínica Atlas", text: "Citas cualificadas sin saturación" },
  { brand: "ShopWave", text: "+18% conversión asistida" },
  { brand: "OpsLab", text: "Routing automático a comerciales" },
];

export function SocialProofBar() {
  const { industry } = useIndustry();
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setI((v) => (v + 1) % FEED.length), 3200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="px-6 py-6 md:px-10" aria-label="Prueba social">
      <div className="content-wrap overflow-hidden rounded-full border border-white/10 bg-white/[0.03] px-5 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] uppercase tracking-widest text-cyan">Live social proof · {industry.label}</p>
          <p className="text-sm text-mist-muted">
            <span className="font-semibold text-white">{FEED[i].brand}</span> — {FEED[i].text}
          </p>
        </div>
      </div>
    </section>
  );
}
