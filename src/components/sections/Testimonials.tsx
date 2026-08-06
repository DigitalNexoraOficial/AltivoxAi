"use client";

import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";

export function Testimonials() {
  const { t } = useI18n();
  return (
    <section id="testimonials" className="section-pad mesh-divider">
      <div className="mx-auto max-w-7xl">
        <Reveal className="text-center">
          <span className="eyebrow">{t.testi.eyebrow}</span>
          <h2 className="heading-display mt-5 text-3xl md:text-5xl">{t.testi.title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-mist">{t.testi.sub}</p>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {t.testi.items.map((item, i) => (
            <Reveal key={item.role} delay={i * 0.07}>
              <blockquote className="glass ui-lift h-full rounded-[1.75rem] p-7">
                <p className="text-sm leading-relaxed text-soft">“{item.quote}”</p>
                <footer className="mt-6 font-mono text-[10px] uppercase tracking-widest text-cyan">{item.role}</footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
