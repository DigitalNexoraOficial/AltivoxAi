"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";

export function StickyCTA() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const nearContact = document.getElementById("contact");
      const contactTop = nearContact?.offsetTop ?? Number.MAX_SAFE_INTEGER;
      setVisible(y > 520 && y + window.innerHeight < contactTop + 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-[90] px-4 md:bottom-6">
      <div className="hero-dock mx-auto flex max-w-3xl flex-col items-center gap-3 rounded-full px-4 py-3 sm:flex-row sm:justify-between sm:px-5">
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium text-white">Primera llamada gratis · precio cerrado</p>
          <p className="text-xs text-mist-muted">Chatbot en 7 días. Sin compromiso.</p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <a href="#ofertas" className="btn-ghost !px-4 !py-2 text-xs w-full sm:w-auto">
            Ver precios
          </a>
          <a href="#contact" className="btn-primary !px-4 !py-2 text-xs w-full sm:w-auto">
            {t.hero.cta2} →
          </a>
        </div>
      </div>
    </div>
  );
}
