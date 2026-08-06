"use client";

import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";

export function Faq() {
  const { t } = useI18n();
  return (
    <section id="faq" className="section-shell">
      <div className="content-wrap max-w-4xl">
        <Reveal className="text-center">
          <span className="eyebrow">{t.faq.eyebrow}</span>
          <h2 className="section-title mt-5">{t.faq.title}</h2>
          <p className="mx-auto mt-4 max-w-lg text-mist-muted">The honest answers.</p>
        </Reveal>
        <div className="mt-12 space-y-3">
          {t.faq.items.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.03}>
              <details className="ref-card ui-lift group !rounded-2xl !p-0 overflow-hidden">
                <summary className="cursor-pointer list-none px-5 py-4 marker:content-none">
                  <span className="flex items-center justify-between gap-4">
                    <span className="font-serif text-lg text-white">{item.q}</span>
                    <span className="text-cyan transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="border-t border-white/10 px-5 pb-5 pt-3 text-sm leading-relaxed text-mist-muted">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
