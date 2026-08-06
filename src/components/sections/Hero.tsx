"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/components/providers/I18nProvider";
import { useIndustry } from "@/components/providers/IndustryProvider";
import { BookingModal } from "@/components/experience/BookingModal";
import { playTone } from "@/lib/sound";
import { getVariant, trackEvent } from "@/lib/ab";

export function Hero() {
  const { t } = useI18n();
  const { industry } = useIndustry();
  const reduce = useReducedMotion();
  const [booking, setBooking] = useState(false);
  const [ctaVariant, setCtaVariant] = useState<"A" | "B">("A");
  const shortDesc = industry.hook;

  useEffect(() => {
    const v = getVariant("hero_cta");
    setCtaVariant(v);
    trackEvent("hero_view", { variant: v });
  }, []);

  const primaryLabel = ctaVariant === "B" ? "Reservar llamada gratis" : `${t.hero.cta1} →`;
  const primaryHref = ctaVariant === "B" ? null : "#ofertas";
  const secondaryLabel = ctaVariant === "B" ? `${t.hero.cta1} →` : "Reservar llamada gratis";

  return (
    <section id="home" className="cinematic-stack relative flex min-h-[100svh] items-center overflow-hidden pt-28" data-story>
      <div className="content-wrap relative z-10 px-6 pb-16 md:px-10 md:pb-24">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-4xl text-center"
        >
          <span className="eyebrow mx-auto">
            <span className="live-dot" />
            LIVE — AGENCIA IA · {industry.label.toUpperCase()}
          </span>

          <p className="mt-8 text-xs font-semibold tracking-[0.22em] text-cyan md:text-sm">
            ALTIVOX<span className="text-white">AI</span>
            <span className="ml-2 font-normal text-mist-muted">AI-NATIVE STUDIO</span>
          </p>

          <h1 className="heading-display mt-6 text-5xl leading-[1.02] md:text-6xl lg:text-7xl">
            {t.hero.title}
            <br />
            <span className="text-gradient">{t.hero.titleAccent}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-mist-muted md:text-lg">{shortDesc}</p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {primaryHref ? (
              <a
                href={primaryHref}
                className="btn-primary ui-lift w-full sm:w-auto"
                onClick={() => {
                  playTone("click");
                  trackEvent("hero_cta_click", { variant: ctaVariant, role: "primary" });
                }}
              >
                {primaryLabel}
              </a>
            ) : (
              <button
                type="button"
                className="btn-primary ui-lift w-full sm:w-auto"
                onClick={() => {
                  setBooking(true);
                  playTone("click");
                  trackEvent("hero_cta_click", { variant: ctaVariant, role: "primary" });
                }}
              >
                {primaryLabel}
              </button>
            )}
            {ctaVariant === "B" ? (
              <a
                href="#ofertas"
                className="btn-ghost ui-lift w-full sm:w-auto"
                onClick={() => {
                  playTone("click");
                  trackEvent("hero_cta_click", { variant: ctaVariant, role: "secondary" });
                }}
              >
                {secondaryLabel}
              </a>
            ) : (
              <button
                type="button"
                className="btn-ghost ui-lift w-full sm:w-auto"
                onClick={() => {
                  setBooking(true);
                  playTone("click");
                  trackEvent("hero_cta_click", { variant: ctaVariant, role: "secondary" });
                }}
              >
                {secondaryLabel}
              </button>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-mist-muted">
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">Primera llamada gratis</span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">Precio cerrado</span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">{industry.proof}</span>
          </div>

          <p className="mt-5 text-[11px] text-mist-muted">{t.hero.risk}</p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-14 max-w-5xl"
          data-story
        >
          <div className="hero-dock relative overflow-hidden rounded-[2rem] p-5 md:p-7">
            <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-cyan/20 blur-[70px]" />
            <div className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-violet/20 blur-[60px]" />

            <div className="relative grid gap-4 md:grid-cols-12">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5 md:col-span-5">
                <p className="step-num">01 — Control</p>
                <p className="mt-3 text-2xl font-semibold text-white">AI Agency OS</p>
                <p className="mt-3 text-sm leading-relaxed text-mist-muted">
                  Foco {industry.label}: {industry.focus.join(" · ")}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 md:col-span-7">
                <div className="hero-metric">
                  <p className="text-[10px] uppercase tracking-widest text-cyan">Latency</p>
                  <p className="mt-2 text-3xl font-semibold text-white">~120ms</p>
                </div>
                <div className="hero-metric">
                  <p className="text-[10px] uppercase tracking-widest text-mist-muted">Modes</p>
                  <p className="mt-2 text-3xl font-semibold text-white">6 agents</p>
                </div>
                <div className="hero-metric sm:col-span-2">
                  <p className="text-[10px] uppercase tracking-widest text-mist-muted">Pipeline</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full w-2/3 rounded-full bg-gradient-to-r from-cyan to-violet" />
                  </div>
                  <p className="mt-2 text-xs text-mist">Lead Ops activos · seguimiento 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <BookingModal open={booking} onClose={() => setBooking(false)} />
    </section>
  );
}
