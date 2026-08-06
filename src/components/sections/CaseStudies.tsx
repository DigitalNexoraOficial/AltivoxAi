"use client";

import { Reveal } from "@/components/ui/Reveal";
import { AnimatedMetric } from "@/components/ui/AnimatedMetric";
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
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {t.cases.items.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <article className="ref-card ui-lift h-full overflow-hidden">
                <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <p className="step-num">Case {String(i + 1).padStart(2, "0")} · Immersive</p>
                    <h3 className="mt-4 text-2xl font-semibold text-white">{c.title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-mist-muted">{c.text}</p>
                    <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4">
                      <p className="text-[10px] uppercase tracking-widest text-mist-muted">Antes → Después</p>
                      <p className="mt-2 text-sm text-soft">Proceso manual y lento → sistema IA con seguimiento automático.</p>
                    </div>
                  </div>
                  <div className="grid gap-3 content-start">
                    <AnimatedMetric label={c.m1} value={i === 0 ? 38 : 22} suffix="%" />
                    <AnimatedMetric label={c.m2} value={i === 0 ? 7 : 14} suffix="d" />
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
