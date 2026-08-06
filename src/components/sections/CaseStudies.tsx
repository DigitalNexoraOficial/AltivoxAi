"use client";

import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";

export function CaseStudies() {
  const { t } = useI18n();
  return (
    <section id="casestudies" className="section-shell">
      <div className="content-wrap">
        <Reveal className="text-center">
          <span className="eyebrow">{t.cases.eyebrow}</span>
          <h2 className="heading-display mt-5 text-3xl md:text-5xl">{t.cases.title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-mist">{t.cases.sub}</p>
        </Reveal>
        <div className="mt-12 grid gap-6 xl:grid-cols-12">
          {t.cases.items.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08} className="xl:col-span-6">
              <article className="ref-card ui-lift h-full">
                <h3 className="font-display text-lg uppercase text-white">{c.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-mist">{c.text}</p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-cyan/20 bg-cyan/10 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-cyan">{c.m1}</p>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-white/5 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-soft">{c.m2}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
