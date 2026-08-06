"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HeroAtmosphere } from "@/components/three/HeroAtmosphere";
import { useI18n } from "@/components/providers/I18nProvider";

export function Hero() {
  const { t } = useI18n();
  const reduce = useReducedMotion();

  return (
    <section id="home" className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 mesh-divider">
      <HeroAtmosphere />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-6 pb-24 md:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">{t.hero.eyebrow}</span>
          <p className="mt-8 font-display text-sm tracking-[0.35em] text-cyan md:text-base">
            ALTIVOX<span className="text-white">AI</span>
          </p>
          <h1 className="heading-display mt-4 text-4xl leading-[1.04] md:text-6xl xl:text-7xl">
            {t.hero.title}
            <br />
            <span className="text-gradient">{t.hero.titleAccent}</span>
          </h1>
          <p className="mt-7 max-w-2xl text-sm font-light leading-relaxed text-mist md:text-base">
            {t.hero.desc}
          </p>

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <a href="#ofertas" className="btn-primary ui-lift w-full sm:w-auto">
              {t.hero.cta1}
            </a>
            <a href="#contact" className="btn-ghost ui-lift w-full sm:w-auto">
              {t.hero.cta2}
            </a>
          </div>

          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-mist-muted">
            {t.hero.risk}
          </p>
        </motion.div>

        <motion.aside
          initial={reduce ? false : { opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="glass-strong ui-lift rounded-[2rem] p-6 md:p-8"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan">Altivox Ops Signal</p>
          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
              <p className="text-[10px] uppercase tracking-widest text-mist-muted">Pipeline state</p>
              <p className="mt-2 font-display text-2xl text-white">LIVE · 24/7</p>
            </div>
            <div className="rounded-2xl border border-cyan/25 bg-cyan/10 p-4">
              <p className="text-[10px] uppercase tracking-widest text-cyan">Automation focus</p>
              <p className="mt-2 text-sm text-soft">Chatbots · Lead Ops · AI Agents</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-widest text-mist-muted">Delivery mode</p>
              <p className="mt-2 text-sm text-soft">Piloto 7 días + escalado premium</p>
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}
