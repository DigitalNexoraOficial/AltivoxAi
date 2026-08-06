"use client";

import { useIndustry } from "@/components/providers/IndustryProvider";
import { playTone } from "@/lib/sound";

export function IndustryPicker() {
  const { industry, industries, setIndustry } = useIndustry();

  return (
    <section className="section-shell pt-8 md:pt-10" id="industria" aria-label="Personalización por industria">
      <div className="content-wrap">
        <div className="ref-card">
          <p className="step-num">Personalización</p>
          <h2 className="heading-display mt-3 text-3xl md:text-5xl">¿Para qué tipo de negocio?</h2>
          <p className="mt-3 max-w-2xl text-sm text-mist-muted md:text-base">
            Adaptamos el mensaje y el foco del sistema a tu industria sin cambiar la oferta base.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {industries.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setIndustry(item.id);
                  playTone("hover");
                }}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-widest transition ${
                  industry.id === item.id ? "border-cyan/50 bg-cyan/15 text-cyan" : "border-white/10 text-mist-muted hover:border-white/25"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 md:col-span-2">
              <p className="text-lg font-semibold text-white">{industry.hook}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {industry.focus.map((f) => (
                  <span key={f} className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-mist-muted">
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-cyan/25 bg-cyan/10 p-4">
              <p className="text-[10px] uppercase tracking-widest text-cyan">Prueba social viva</p>
              <p className="mt-3 text-2xl font-semibold text-white">{industry.proof}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
