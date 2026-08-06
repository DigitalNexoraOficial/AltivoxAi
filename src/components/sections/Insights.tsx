"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";

export function Insights() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(null);
  const item = open !== null ? t.blog.items[open] : null;

  return (
    <section id="blog" className="section-shell">
      <div className="content-wrap">
        <Reveal className="text-center">
          <span className="eyebrow">{t.blog.eyebrow}</span>
          <h2 className="heading-display mt-5 text-3xl md:text-5xl">{t.blog.title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-mist">{t.blog.sub}</p>
        </Reveal>
        <div className="mt-12 grid gap-6 xl:grid-cols-12">
          {t.blog.items.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.06} className={i === 0 ? "xl:col-span-6" : "xl:col-span-3"}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="ref-card ui-lift h-full w-full text-left hover:border-cyan/30"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-cyan">{b.meta}</p>
                <h3 className="mt-4 font-display text-base uppercase text-white">{b.title}</h3>
                <p className="mt-3 text-sm text-mist">{b.short}</p>
                <span className="mt-6 inline-block text-[10px] uppercase tracking-widest text-cyan">{t.blog.read}</span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {item ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-6" onClick={() => setOpen(null)} role="presentation">
          <div className="glass-strong max-w-lg rounded-3xl p-8" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3 className="font-display text-xl uppercase text-white">{item.title}</h3>
            <p className="mt-4 text-sm text-mist">{item.long}</p>
            <button type="button" className="btn-ghost ui-lift mt-6" onClick={() => setOpen(null)}>
              OK
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
