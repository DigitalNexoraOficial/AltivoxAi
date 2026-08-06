"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HeroAtmosphere } from "@/components/three/HeroAtmosphere";
import { useI18n } from "@/components/providers/I18nProvider";

const chips = ["AI Ops", "Chatbots", "Lead Systems", "Automation", "Agents"];

export function Hero() {
  const { t } = useI18n();
  const reduce = useReducedMotion();

  return (
    <section id="home" className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 mesh-divider">
      <HeroAtmosphere />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 md:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="eyebrow">{t.hero.eyebrow}</span>
            <p className="mt-7 font-display text-sm tracking-[0.35em] text-cyan md:text-base">
              ALTIVOX<span className="text-white">AI</span>
            </p>
            <h1 className="heading-display mt-4 text-5xl leading-[0.98] md:text-7xl xl:text-[6.4rem]">
              {t.hero.title}
              <br />
              <span className="text-gradient">{t.hero.titleAccent}</span>
            </h1>

            <p className="mt-6 max-w-2xl text-sm font-light leading-relaxed text-mist md:text-base">
              {t.hero.desc}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#ofertas" className="btn-primary ui-lift w-full sm:w-auto">
                {t.hero.cta1}
              </a>
              <a href="#contact" className="btn-ghost ui-lift w-full sm:w-auto">
                {t.hero.cta2}
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span key={chip} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-widest text-mist-muted">
                  {chip}
                </span>
              ))}
            </div>

            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-mist-muted">{t.hero.risk}</p>
          </motion.div>

          <motion.aside
            initial={reduce ? false : { opacity: 0, x: 18, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.95, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong ui-lift rounded-[2rem] p-5 md:p-7"
          >
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan">Control Center</p>
              <p className="mt-2 font-display text-2xl uppercase text-white">AI Agency OS</p>
              <p className="mt-2 text-xs leading-relaxed text-mist">Captura, cualificación y seguimiento en una sola capa operativa.</p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-cyan/25 bg-cyan/10 p-3">
                <p className="text-[10px] uppercase tracking-widest text-cyan">Latency</p>
                <p className="mt-1 font-display text-lg text-white">~120ms</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-widest text-mist-muted">Modes</p>
                <p className="mt-1 font-display text-lg text-white">6 agents</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] uppercase tracking-widest text-mist-muted">Pipeline</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full w-2/3 rounded-full bg-gradient-to-r from-cyan to-violet" />
              </div>
              <p className="mt-2 text-xs text-mist">Lead Ops activos · seguimiento 24/7</p>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
