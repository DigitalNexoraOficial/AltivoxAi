/**
 * Public site settings for landing overrides.
 * GET returns merged brand/hero/contact/flags/social from Supabase site_settings.
 */
import { NextResponse } from "next/server";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://soeyfivsuwohuuzgfqar.supabase.co";

const DEFAULTS = {
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

function key() {
  // Public read path: anon key only (never service role fallback).
  return String(process.env.SUPABASE_ANON_KEY || "").trim();
}

export async function GET() {
  const apikey = key();
  if (!apikey) {
    return NextResponse.json({ ok: true, settings: DEFAULTS, source: "defaults" });
  }

  try {
    const res = await fetch(
      SUPABASE_URL + "/rest/v1/site_settings?select=key,value",
      {
        headers: {
          apikey,
          Authorization: "Bearer " + apikey,
        },
        next: { revalidate: 30 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ ok: true, settings: DEFAULTS, source: "defaults" });
    }

    const rows = (await res.json()) as { key: string; value: Record<string, unknown> }[];
    const map: Record<string, Record<string, unknown>> = {};
    for (const row of rows || []) map[row.key] = row.value || {};

    const settings = {
      brand: { ...DEFAULTS.brand, ...(map.brand || {}) },
      hero: { ...DEFAULTS.hero, ...(map.hero || {}) },
      contact: { ...DEFAULTS.contact, ...(map.contact || {}) },
      flags: { ...DEFAULTS.flags, ...(map.flags || {}) },
      social: { ...DEFAULTS.social, ...(map.social || {}) },
    };

    return NextResponse.json(
      { ok: true, settings, source: "supabase" },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch {
    return NextResponse.json({ ok: true, settings: DEFAULTS, source: "defaults" });
  }
}
