"use client";

import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";

export function About() {
  const { t } = useI18n();
  return (
    <section id="equipo" className="section-shell">
      <div className="content-wrap grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <Reveal>
          <span className="eyebrow">{t.about.eyebrow}</span>
          <h2 className="section-title mt-5">{t.about.title}</h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-mist-muted md:text-lg">{t.about.desc}</p>
          <pre className="mt-6 whitespace-pre-wrap font-sans text-sm text-soft">{t.about.points}</pre>
          <a href="#contact" className="btn-primary ui-lift mt-8 inline-flex">
            {t.about.cta} →
          </a>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="ref-card-strong ui-lift relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan/20 blur-3xl" />
            <div className="absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-violet/25 blur-2xl" />
            <p className="step-num">Is this you?</p>
            <p className="mt-5 font-serif text-4xl leading-[1.05] text-white md:text-5xl">
              Más leads.
              <br />
              <span className="text-gradient">Menos trabajo manual.</span>
            </p>
            <p className="mt-6 text-sm text-mist-muted">www.altivoxai.es</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
