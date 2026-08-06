"use client";

import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";

export function Offers() {
  const { t } = useI18n();

  return (
    <section id="ofertas" className="section-shell">
      <div className="content-wrap">
        <Reveal className="text-center">
          <span className="eyebrow">{t.offers.eyebrow}</span>
          <h2 className="section-title mt-5">{t.offers.title}</h2>
          <p className="mx-auto section-sub">{t.offers.sub}</p>
        </Reveal>

        <div className="mt-14 grid gap-6 xl:grid-cols-12">
          {t.offers.items.map((offer, i) => (
            <Reveal key={offer.title} delay={i * 0.08} className={i === 1 ? "xl:col-span-5" : "xl:col-span-3"}>
              <article className={`ref-card ui-lift relative flex h-full flex-col ${i === 1 ? "border-cyan/40 shadow-glow xl:-translate-y-4" : ""}`}>
                {i === 1 ? <span className="absolute -top-3 left-8 rounded-full bg-cyan px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink">Premium</span> : null}
                <p className="font-mono text-[10px] uppercase tracking-widest text-mist-muted">Paquete {i + 1}</p>
                <h3 className="mt-3 font-display text-lg uppercase text-white">{offer.title}</h3>
                <p className="mt-4 font-display text-2xl text-cyan">{offer.price}</p>
                <p className="mt-5 flex-1 text-sm leading-relaxed text-mist">{offer.desc}</p>
                <a href="#contact" className="btn-ghost ui-lift mt-8 w-full">{offer.cta}</a>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
