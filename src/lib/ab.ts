"use client";

/** Lightweight A/B assignment without third-party SDK overhead. */
export type ExperimentKey = "hero_cta" | "pricing_badge";

export function getVariant(key: ExperimentKey): "A" | "B" {
  if (typeof window === "undefined") return "A";
  const storageKey = `altivox-ab-${key}`;
  const existing = window.localStorage.getItem(storageKey);
  if (existing === "A" || existing === "B") return existing;
  const next = Math.random() < 0.5 ? "A" : "B";
  window.localStorage.setItem(storageKey, next);
  return next;
}

export function trackEvent(name: string, payload?: Record<string, string>) {
  if (typeof window === "undefined") return;
  // Compatible hook for future PostHog/Vercel Analytics without forcing a SDK.
  const w = window as Window & { altivoxTrack?: (n: string, p?: Record<string, string>) => void };
  w.altivoxTrack?.(name, payload);
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[altivox-ab]", name, payload || {});
  }
}
