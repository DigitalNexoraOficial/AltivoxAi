"use client";

import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";

export function CaseStudies() {
  const { t } = useI18n();
  return (
    <section id="casestudies" className="section-pad">
      <div className="mx-auto max-w-7xl">
        <Reveal className="text-center">
          <span className="eyebrow">{t.cases.eyebrow}</span>
          <h2 className="heading-display mt-5 text-3xl md:text-5xl">
            {t.cases.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-mist">{t.cases.sub}</p>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {t.cases.items.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <article className="glass rounded-[1.75rem] p-8">
                <h3 className="font-display text-lg uppercase text-white">
                  {c.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-mist">{c.text}</p>
                <div className="mt-8 flex gap-6">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-mist-muted">
                      {c.m1}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-mist-muted">
                      {c.m2}
                    </p>
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
