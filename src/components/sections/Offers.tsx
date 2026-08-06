"use client";

import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";

export function Offers() {
  const { t } = useI18n();

  return (
    <section id="ofertas" className="section-pad relative">
      <div className="mx-auto max-w-7xl">
        <Reveal className="text-center">
          <span className="eyebrow">{t.offers.eyebrow}</span>
          <h2 className="heading-display mt-5 text-3xl md:text-5xl">
            {t.offers.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-mist">
            {t.offers.sub}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {t.offers.items.map((offer, i) => (
            <Reveal key={offer.title} delay={i * 0.08}>
              <article
                className={`glass relative flex h-full flex-col rounded-[1.75rem] p-8 ${
                  i === 1 ? "border-cyan/40 shadow-glow lg:-translate-y-3" : ""
                }`}
              >
                {i === 1 ? (
                  <span className="absolute -top-3 left-8 rounded-full bg-cyan px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink">
                    Popular
                  </span>
                ) : null}
                <h3 className="font-display text-lg uppercase text-white">
                  {offer.title}
                </h3>
                <p className="mt-4 font-display text-2xl text-cyan">
                  {offer.price}
                </p>
                <p className="mt-5 flex-1 text-sm leading-relaxed text-mist">
                  {offer.desc}
                </p>
                <a href="#contact" className="btn-ghost mt-8 w-full">
                  {offer.cta}
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
