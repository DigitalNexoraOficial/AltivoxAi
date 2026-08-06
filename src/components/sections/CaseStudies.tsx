"use client";

import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";

export function CaseStudies() {
  const { t } = useI18n();
  return (
    <section id="casestudies" className="section-pad mesh-divider">
      <div className="mx-auto max-w-7xl">
        <Reveal className="text-center">
          <span className="eyebrow">{t.cases.eyebrow}</span>
          <h2 className="heading-display mt-5 text-3xl md:text-5xl">{t.cases.title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-mist">{t.cases.sub}</p>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {t.cases.items.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <article className="glass ui-lift rounded-[1.75rem] p-8">
                <h3 className="font-display text-lg uppercase text-white">{c.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-mist">{c.text}</p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-cyan/20 bg-cyan/10 p-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-cyan">{c.m1}</p>
                  </div>
                  <div className="rounded-xl border border-white/12 bg-white/5 p-3">
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
