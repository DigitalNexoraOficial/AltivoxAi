"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";
import { cmsPosts } from "@/content/cms";

export function Insights() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(null);
  const items = t.blog.items.map((b, i) => ({
    ...b,
    long: cmsPosts[i]?.body || b.long,
    title: cmsPosts[i]?.title || b.title,
    short: cmsPosts[i]?.excerpt || b.short,
  }));
  const item = open !== null ? items[open] : null;

  return (
    <section id="blog" className="section-shell">
      <div className="content-wrap">
        <Reveal className="text-center">
          <span className="eyebrow">{t.blog.eyebrow}</span>
          <h2 className="section-title mt-5">{t.blog.title}</h2>
          <p className="mx-auto section-sub">{t.blog.sub}</p>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {items.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.06}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="ref-card ui-lift h-full w-full text-left hover:border-cyan/30"
              >
                <p className="step-num">{b.meta}</p>
                <h3 className="mt-4 font-sans font-semibold text-xl text-white">{b.title}</h3>
                <p className="mt-3 text-sm text-mist-muted">{b.short}</p>
                <span className="mt-6 inline-block text-[12px] text-cyan">{t.blog.read} →</span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {item ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-6" onClick={() => setOpen(null)} role="presentation">
          <div className="glass-strong max-w-lg rounded-3xl p-8" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3 className="font-sans font-semibold text-2xl text-white">{item.title}</h3>
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
