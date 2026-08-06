"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useIndustry } from "@/components/providers/IndustryProvider";
import { playTone } from "@/lib/sound";
import { getVariant, trackEvent } from "@/lib/ab";

const SECTION_CTA: Record<string, { title: string; mobileTitle: string; href: string; label: string }> = {
  services: {
    title: "¿Quieres este ecosistema en tu negocio?",
    mobileTitle: "¿Lo quieres en tu negocio?",
    href: "#ofertas",
    label: "Ver precios",
  },
  ofertas: {
    title: "Elige paquete y agenda llamada",
    mobileTitle: "Elige paquete y agenda",
    href: "#contact",
    label: "Pedir piloto",
  },
  auditoria: {
    title: "Tu score IA ya está listo",
    mobileTitle: "Score listo. Siguiente paso",
    href: "#contact",
    label: "Hablar ahora",
  },
  quiz: {
    title: "Recomendación lista. Siguiente paso.",
    mobileTitle: "Recomendación lista",
    href: "#ofertas",
    label: "Ver paquete",
  },
  casestudies: {
    title: "Resultados reales. Tu turno.",
    mobileTitle: "Tu turno: calcula ROI",
    href: "#calculator",
    label: "Calcular ROI",
  },
  calculator: {
    title: "Convierte el ahorro en un plan",
    mobileTitle: "Pasa el ahorro a un plan",
    href: "#contact",
    label: "Hablar ahora",
  },
  simulator: {
    title: "Pasa de demo a piloto en 7 días",
    mobileTitle: "Piloto en 7 días",
    href: "#contact",
    label: "Empezar",
  },
  default: {
    title: "Primera llamada gratis · precio cerrado",
    mobileTitle: "Llamada gratis · precio cerrado",
    href: "#contact",
    label: "Contactar",
  },
};

export function StickyCTA() {
  const { t } = useI18n();
  const { industry } = useIndustry();
  const [visible, setVisible] = useState(false);
  const [section, setSection] = useState("default");
  const [badge, setBadge] = useState("Chatbot en 7 días");

  useEffect(() => {
    const v = getVariant("pricing_badge");
    setBadge(v === "B" ? "Precio cerrado" : "Chatbot en 7 días");
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = y / max;
      const current = document.documentElement.dataset.section || "default";
      setSection(current);
      setVisible(y > 520 && progress < 0.72);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.stickyCta = visible ? "1" : "0";
    return () => {
      document.documentElement.dataset.stickyCta = "0";
    };
  }, [visible]);

  const cta = useMemo(() => SECTION_CTA[section] || SECTION_CTA.default, [section]);
  const primaryLabel = cta.label === "Contactar" ? t.hero.cta2 : cta.label;

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[4.75rem] z-[90] px-3 sm:bottom-4 sm:px-4 md:bottom-6">
      <div className="pointer-events-auto hero-dock mx-auto flex w-full max-w-3xl flex-col gap-2.5 rounded-2xl border border-white/10 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:rounded-full sm:px-5 sm:py-3">
        <div className="min-w-0 text-left">
          <p className="truncate text-[13px] font-medium leading-snug text-white sm:text-sm">
            <span className="sm:hidden">{cta.mobileTitle}</span>
            <span className="hidden sm:inline">{cta.title}</span>
          </p>
          <p className="mt-0.5 truncate text-[11px] text-mist-muted">
            <span className="sm:hidden">{badge}</span>
            <span className="hidden sm:inline">
              {industry.proof} · {badge}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto sm:shrink-0">
          <a
            href="#ofertas"
            className="btn-ghost !rounded-xl !px-3 !py-2.5 text-center text-[11px] sm:!rounded-full sm:!px-4 sm:!py-2 sm:text-xs"
            onClick={() => playTone("click")}
          >
            Precios
          </a>
          <a
            href={cta.href}
            className="btn-primary !rounded-xl !px-3 !py-2.5 text-center text-[11px] sm:!rounded-full sm:!px-4 sm:!py-2 sm:text-xs"
            onClick={() => {
              playTone("click");
              trackEvent("sticky_cta_click", { section });
            }}
          >
            {primaryLabel} →
          </a>
        </div>
      </div>
    </div>
  );
}
