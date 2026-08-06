"use client";

import { useMemo, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";

export function Services() {
  const { t } = useI18n();
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState<string | null>(null);

  const items = useMemo(
    () => t.services.items.filter((item) => filter === "all" || item.category === filter),
    [t.services.items, filter]
  );

  const activeItem = t.services.items.find((i) => i.id === active);

  return (
    <section id="services" className="section-shell">
      <div className="content-wrap">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="eyebrow">{t.services.eyebrow}</span>
              <h2 className="heading-display mt-5 max-w-3xl text-3xl md:text-5xl">{t.services.title}</h2>
            </div>
            <p className="max-w-xl text-sm text-mist md:text-base">{t.services.sub}</p>
          </div>
        </Reveal>

        <div className="mt-10 flex flex-wrap gap-2">
          {t.services.filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-widest transition ${
                filter === f.id ? "border-cyan/50 bg-cyan/15 text-cyan" : "border-white/10 text-mist-muted hover:border-white/25"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-12">
          {items.map((item, i) => {
            const wide = i === 0 || i === 3 || i === 4;
            return (
              <Reveal key={item.id} delay={i * 0.05} className={wide ? "xl:col-span-6" : "xl:col-span-3"}>
                <button
                  type="button"
                  onClick={() => setActive(item.id)}
                  className="ref-card ui-lift group h-full w-full text-left hover:border-cyan/30 hover:shadow-glow"
                >
                  <div className="mb-8 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-cyan">{item.category}</span>
                    <span className="rounded-full border border-cyan/40 bg-cyan/20 px-2 py-1 text-[9px] uppercase tracking-widest text-cyan">AI</span>
                  </div>
                  <h3 className="font-display text-base uppercase tracking-wide text-white md:text-lg">{item.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-mist">{item.short}</p>
                  <span className="mt-7 inline-block text-[10px] uppercase tracking-widest text-cyan">{t.services.seeDetails}</span>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>

      {activeItem ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm" onClick={() => setActive(null)} role="presentation">
          <div role="dialog" aria-modal="true" className="glass-strong max-h-[85vh] w-full max-w-xl overflow-auto rounded-3xl p-8" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="float-right text-mist hover:text-white" aria-label="Close" onClick={() => setActive(null)}>
              ×
            </button>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan">Servicio</p>
            <h3 className="mt-3 font-display text-xl uppercase text-white">{activeItem.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-mist">{activeItem.long}</p>
            <a href="#contact" className="btn-primary ui-lift mt-8" onClick={() => setActive(null)}>
              Contact
            </a>
          </div>
        </div>
      ) : null}
    </section>
  );
}
