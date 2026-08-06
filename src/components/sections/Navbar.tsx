"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const links = [
  ["services", "services"],
  ["offers", "ofertas"],
  ["cases", "casestudies"],
  ["calc", "calculator"],
  ["contact", "contact"],
] as const;

export function Navbar() {
  const { t, lang, toggleLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition ${scrolled ? "py-3" : "py-5"}`}>
      <div className="content-wrap flex items-center justify-between px-6 md:px-10">
        <a href="#home" className={`flex items-center gap-3 rounded-full px-3 py-2 ${scrolled ? "hero-dock" : ""}`}>
          <Image src="/favicon.png" alt="AltivoxAi" width={34} height={34} className="rounded-full border border-cyan/30" priority />
          <span className="font-sans font-semibold text-xs tracking-[0.16em] text-white md:text-sm">
            ALTIVOX<span className="text-cyan">AI</span>
          </span>
        </a>

        <nav className={`hidden items-center gap-6 rounded-full px-5 py-2.5 lg:flex ${scrolled ? "hero-dock" : ""}`}>
          {links.map(([key, href]) => (
            <a key={href} href={`#${href}`} className="text-[12px] text-mist-muted transition hover:text-white">
              {t.nav[key]}
            </a>
          ))}
          <ThemeToggle />
          <button type="button" onClick={toggleLang} className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-cyan" aria-label={t.common.lang}>
            {lang === "es" ? "EN" : "ES"}
          </button>
          <Link href="/login.html" className="btn-primary !px-4 !py-2 text-xs">Panel</Link>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button type="button" onClick={toggleLang} className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] text-cyan" aria-label={t.common.lang}>
            {lang === "es" ? "EN" : "ES"}
          </button>
          <button type="button" className="glass rounded-full px-3 py-2 text-[10px] uppercase tracking-widest text-white" aria-expanded={open} aria-label={t.common.menu} onClick={() => setOpen((v) => !v)}>
            Menu
          </button>
        </div>
      </div>

      {open ? (
        <div className="glass mx-4 mt-3 rounded-3xl p-5 lg:hidden">
          <div className="flex flex-col gap-3">
            {links.map(([key, href]) => (
              <a key={href} href={`#${href}`} onClick={() => setOpen(false)} className="text-sm text-mist transition hover:text-cyan">
                {t.nav[key]}
              </a>
            ))}
            <Link href="/login.html" className="text-sm text-cyan" onClick={() => setOpen(false)}>Panel</Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
