"use client";

import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";

export function FinalCTA() {
  const { t } = useI18n();
  return (
    <section className="section-shell pt-8 md:pt-10" aria-label="final call to action">
      <div className="content-wrap">
        <Reveal>
          <div className="ref-card-strong relative overflow-hidden text-center">
            <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-cyan/20 blur-[80px]" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-violet/20 blur-[80px]" />
            <p className="step-num relative">Listo para empezar</p>
            <h2 className="heading-display relative mt-4 text-3xl md:text-5xl">
              Automatiza tu captación.
              <br />
              <span className="text-gradient">Empieza esta semana.</span>
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-sm text-mist-muted md:text-base">
              Primera llamada gratis, precio cerrado y chatbot operativo en 7 días. Sin letra pequeña.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#contact" className="btn-primary ui-lift w-full sm:w-auto">
                {t.hero.cta2} →
              </a>
              <a href="#ofertas" className="btn-ghost ui-lift w-full sm:w-auto">
                Ver paquetes
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
