"use client";

import { useMemo, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";

export function Services() {
  const { t } = useI18n();
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState<string | null>(null);

  const items = useMemo(
    () =>
      t.services.items.filter(
        (item) => filter === "all" || item.category === filter
      ),
    [t.services.items, filter]
  );

  const activeItem = t.services.items.find((i) => i.id === active);

  return (
    <section id="services" className="section-pad relative">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <span className="eyebrow">{t.services.eyebrow}</span>
          <h2 className="heading-display mt-5 max-w-3xl text-3xl md:text-5xl">
            {t.services.title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm text-mist md:text-base">
            {t.services.sub}
          </p>
        </Reveal>

        <div className="mt-10 flex flex-wrap gap-2">
          {t.services.filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-widest transition ${
                filter === f.id
                  ? "border-cyan/50 bg-cyan/15 text-cyan"
                  : "border-white/10 text-mist-muted hover:border-white/25"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.05}>
              <button
                type="button"
                onClick={() => setActive(item.id)}
                className="glass group h-full w-full rounded-3xl p-6 text-left transition hover:-translate-y-1 hover:border-cyan/30 hover:shadow-glow"
              >
                <div className="mb-6 h-px w-12 bg-gradient-to-r from-cyan to-violet opacity-70 transition group-hover:w-20" />
                <h3 className="font-display text-sm uppercase tracking-wide text-white md:text-base">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-mist">
                  {item.short}
                </p>
                <span className="mt-6 inline-block text-[10px] uppercase tracking-widest text-cyan">
                  {t.services.seeDetails}
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {activeItem ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          onClick={() => setActive(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            className="glass max-h-[85vh] w-full max-w-lg overflow-auto rounded-3xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="float-right text-mist hover:text-white"
              aria-label="Close"
              onClick={() => setActive(null)}
            >
              ×
            </button>
            <h3 className="font-display text-xl uppercase text-white">
              {activeItem.title}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-mist">
              {activeItem.long}
            </p>
            <a href="#contact" className="btn-primary mt-8" onClick={() => setActive(null)}>
              Contact
            </a>
          </div>
        </div>
      ) : null}
    </section>
  );
}
