"use client";

import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";

export function Testimonials() {
  const { t } = useI18n();
  return (
    <section id="testimonials" className="section-shell">
      <div className="content-wrap">
        <Reveal className="text-center">
          <span className="eyebrow">{t.testi.eyebrow}</span>
          <h2 className="section-title mt-5">{t.testi.title}</h2>
          <p className="mx-auto section-sub">{t.testi.sub}</p>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {t.testi.items.map((item, i) => (
            <Reveal key={item.role} delay={i * 0.07}>
              <blockquote className="ref-card ui-lift h-full">
                <p className="step-num">0{i + 1} · Community</p>
                <p className="mt-5 text-base leading-relaxed text-soft">“{item.quote}”</p>
                <footer className="mt-6 font-mono text-[10px] uppercase tracking-widest text-cyan">{item.role}</footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
