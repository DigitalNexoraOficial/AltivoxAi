"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";

export function ScrollTop() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      aria-label={t.common.top}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan/30 bg-cyan/15 text-cyan backdrop-blur transition hover:bg-cyan/25 hover:shadow-glow"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
        <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
