"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useIndustry } from "@/components/providers/IndustryProvider";
import { playTone } from "@/lib/sound";

const SECTION_CTA: Record<string, { title: string; href: string; label: string }> = {
  services: { title: "¿Quieres este ecosistema en tu negocio?", href: "#ofertas", label: "Ver precios" },
  ofertas: { title: "Elige paquete y agenda llamada", href: "#contact", label: "Pedir piloto" },
  casestudies: { title: "Resultados reales. Tu turno.", href: "#calculator", label: "Calcular ROI" },
  calculator: { title: "Convierte el ahorro en un plan", href: "#contact", label: "Hablar ahora" },
  simulator: { title: "Pasa de demo a piloto en 7 días", href: "#contact", label: "Empezar" },
  default: { title: "Primera llamada gratis · precio cerrado", href: "#contact", label: "Contactar" },
};

export function StickyCTA() {
  const { t } = useI18n();
  const { industry } = useIndustry();
  const [visible, setVisible] = useState(false);
  const [section, setSection] = useState("default");

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

  const cta = useMemo(() => SECTION_CTA[section] || SECTION_CTA.default, [section]);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-[90] px-4 md:bottom-6 mobile-snap-safe">
      <div className="hero-dock mx-auto flex max-w-3xl flex-col items-center gap-3 rounded-full px-4 py-3 sm:flex-row sm:justify-between sm:px-5">
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium text-white">{cta.title}</p>
          <p className="text-xs text-mist-muted">{industry.proof} · Chatbot en 7 días</p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <a href="#ofertas" className="btn-ghost !px-4 !py-2 text-xs w-full sm:w-auto" onClick={() => playTone("click")}>
            Ver precios
          </a>
          <a href={cta.href} className="btn-primary !px-4 !py-2 text-xs w-full sm:w-auto" onClick={() => playTone("click")}>
            {cta.label === "Contactar" ? t.hero.cta2 : cta.label} →
          </a>
        </div>
      </div>
    </div>
  );
}
