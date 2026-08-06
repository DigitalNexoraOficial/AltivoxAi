"use client";

import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";

export function Faq() {
  const { t } = useI18n();
  return (
    <section id="faq" className="section-pad">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <span className="eyebrow">{t.faq.eyebrow}</span>
          <h2 className="heading-display mt-5 text-3xl md:text-5xl">
            {t.faq.title}
          </h2>
        </Reveal>
        <div className="mt-12 space-y-3">
          {t.faq.items.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.03}>
              <details className="glass group rounded-2xl px-5 py-4">
                <summary className="cursor-pointer list-none font-display text-sm uppercase tracking-wide text-white marker:content-none">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <span className="text-cyan transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-mist">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
