"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HeroAtmosphere } from "@/components/three/HeroAtmosphere";
import { useI18n } from "@/components/providers/I18nProvider";

export function Hero() {
  const { t } = useI18n();
  const reduce = useReducedMotion();

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-28"
    >
      <HeroAtmosphere />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-24 text-center md:px-10">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-8 flex justify-center">
            <span className="eyebrow">{t.hero.eyebrow}</span>
          </div>

          <p className="mb-4 font-display text-sm tracking-[0.35em] text-cyan md:text-base">
            ALTIVOX<span className="text-white">AI</span>
          </p>

          <h1 className="heading-display text-4xl leading-[1.05] md:text-6xl lg:text-7xl">
            {t.hero.title}
            <br />
            <span className="text-gradient">{t.hero.titleAccent}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm font-light leading-relaxed text-mist md:text-base">
            {t.hero.desc}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="#ofertas" className="btn-primary w-full sm:w-auto">
              {t.hero.cta1}
            </a>
            <a href="#contact" className="btn-ghost w-full sm:w-auto">
              {t.hero.cta2}
            </a>
          </div>

          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-mist-muted">
            {t.hero.risk}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
