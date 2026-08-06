"use client";

import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";

export function Offers() {
  const { t } = useI18n();

  return (
    <section id="ofertas" className="section-shell" data-story>
      <div className="content-wrap">
        <Reveal className="text-center">
          <span className="eyebrow">
            <span className="live-dot" />
            {t.offers.eyebrow}
          </span>
          <h2 className="section-title mt-5">{t.offers.title}</h2>
          <p className="mx-auto section-sub">{t.offers.sub}</p>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {t.offers.items.map((offer, i) => (
            <Reveal key={offer.title} delay={i * 0.08}>
              <article className={`ref-card ui-lift relative flex h-full flex-col ${i === 1 ? "border-cyan/40 lg:-translate-y-3" : ""}`}>
                {i === 1 ? (
                  <span className="absolute -top-3 left-8 rounded-full bg-cyan px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink">
                    Popular
                  </span>
                ) : null}
                <p className="step-num">Paquete {String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 font-sans font-semibold text-2xl text-white">{offer.title}</h3>
                <p className="mt-4 font-sans font-semibold text-4xl text-cyan">{offer.price}</p>
                <p className="mt-5 flex-1 text-sm leading-relaxed text-mist-muted">{offer.desc}</p>
                <a href="#contact" className={`${i === 1 ? "btn-primary" : "btn-ghost"} ui-lift mt-8 w-full`}>
                  {offer.cta} →
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
