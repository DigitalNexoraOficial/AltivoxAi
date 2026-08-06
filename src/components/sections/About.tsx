"use client";

import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";

export function About() {
  const { t } = useI18n();
  return (
    <section id="equipo" className="section-pad">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <Reveal>
          <span className="eyebrow">{t.about.eyebrow}</span>
          <h2 className="heading-display mt-5 text-3xl md:text-5xl">
            {t.about.title}
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-mist md:text-base">
            {t.about.desc}
          </p>
          <pre className="mt-6 whitespace-pre-wrap font-sans text-sm text-soft">
            {t.about.points}
          </pre>
          <a href="#contact" className="btn-primary mt-8 inline-flex">
            {t.about.cta}
          </a>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="glass relative overflow-hidden rounded-[2rem] p-10">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan/20 blur-3xl" />
            <p className="font-display text-4xl uppercase leading-tight text-white md:text-5xl">
              Más leads.
              <br />
              <span className="text-gradient">Menos trabajo manual.</span>
            </p>
            <p className="mt-6 text-sm text-mist">www.altivoxai.es</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
