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
          <h2 className="section-title mt-5">{t.cases.title}</h2>
          <p className="mx-auto section-sub">{t.cases.sub}</p>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {t.cases.items.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <article className="ref-card ui-lift h-full">
                <p className="step-num">Case {String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 font-sans font-semibold text-2xl text-white">{c.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-mist-muted">{c.text}</p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-cyan/20 bg-cyan/10 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-cyan">{c.m1}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
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
