"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type SiteSettings = {
  brand: {
    name: string;
    mark: string;
    tagline: string;
    email: string;
    whatsapp: string;
  };
  hero: {
    title: string;
    titleAccent: string;
    cta1: string;
    cta2: string;
    risk: string;
  };
  contact: {
    email: string;
    whatsapp: string;
    whatsappLabel: string;
  };
  flags: {
    chatEnabled: boolean;
    bookingEnabled: boolean;
    leadMagnetEnabled: boolean;
    stickyCtaEnabled: boolean;
  };
  social: {
    linkedin: string;
    instagram: string;
    x: string;
  };
};

const DEFAULTS: SiteSettings = {
  brand: {
    name: "AltivoxAi",
    mark: "ALTIVOXAI",
    tagline: "AI-Native Studio",
    email: "info@altivoxai.es",
    whatsapp: "34600000000",
  },
  hero: {
    title: "Más leads.",
    titleAccent: "Menos trabajo manual",
    cta1: "Ver ofertas y precios",
    cta2: "Reservar llamada gratis",
    risk: "Riesgo bajo · Precio cerrado · Entrega en días, no meses",
  },
  contact: {
    email: "info@altivoxai.es",
    whatsapp: "34600000000",
    whatsappLabel: "Solicita una reunión",
  },
  flags: {
    chatEnabled: true,
    bookingEnabled: true,
    leadMagnetEnabled: true,
    stickyCtaEnabled: true,
  },
  social: {
    linkedin: "",
    instagram: "",
    x: "",
  },
};

const Ctx = createContext<SiteSettings>(DEFAULTS);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);

  useEffect(() => {
    let alive = true;
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data) => {
        if (!alive || !data?.settings) return;
        setSettings({
          brand: { ...DEFAULTS.brand, ...data.settings.brand },
          hero: { ...DEFAULTS.hero, ...data.settings.hero },
          contact: { ...DEFAULTS.contact, ...data.settings.contact },
          flags: { ...DEFAULTS.flags, ...data.settings.flags },
          social: { ...DEFAULTS.social, ...data.settings.social },
        });
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(() => settings, [settings]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSiteSettings() {
  return useContext(Ctx);
}
