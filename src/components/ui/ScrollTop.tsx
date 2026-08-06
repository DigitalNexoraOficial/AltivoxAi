"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";

export function ScrollTop() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      aria-label={t.common.top}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="glass fixed bottom-6 left-6 z-[90] rounded-full px-3 py-3 text-cyan transition hover:shadow-glow"
    >
      ↑
    </button>
  );
}
