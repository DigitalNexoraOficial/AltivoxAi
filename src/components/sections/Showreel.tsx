"use client";

import { Reveal } from "@/components/ui/Reveal";
import { tokens } from "@/lib/brand-system";

export function Showreel() {
  return (
    <section id="showreel" className="section-shell pt-10 md:pt-14" aria-label="Showreel">
      <div className="content-wrap">
        <Reveal>
          <div className="ref-card-strong relative overflow-hidden">
            <p className="step-num">Showreel 20s · lightweight</p>
            <h2 className="heading-display mt-3 text-3xl md:text-5xl">Así se siente Altivox</h2>
            <div className="relative mt-8 h-48 overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/50 md:h-64">
              <div className="showreel-track absolute inset-y-0 left-0 flex items-center gap-6 px-6">
                {[
                  "Captura",
                  "Score",
                  "Routing",
                  "Chat",
                  "Piloto 7d",
                  "Ops Panel",
                  "ROI",
                  "Booking",
                  "Captura",
                  "Score",
                  "Routing",
                  "Chat",
                  "Piloto 7d",
                  "Ops Panel",
                  "ROI",
                  "Booking",
                ].map((item, i) => (
                  <div
                    key={`${item}-${i}`}
                    className="flex h-28 w-44 shrink-0 items-center justify-center rounded-2xl border border-cyan/25 bg-cyan/10 text-sm font-semibold text-white"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]" />
            </div>
            <p className="mt-4 text-xs text-mist-muted">{tokens.brand.guarantee}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
