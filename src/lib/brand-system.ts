/**
 * Altivox Design Tokens
 * Single source of truth for color, type, motion and spacing.
 * Used by UI + /design-system page (Storybook-light).
 */
export const tokens = {
  color: {
    bg: "#050505",
    bgSoft: "#0a0a0b",
    panel: "#101012",
    cyan: "#22d3ee",
    cyanDeep: "#0284c7",
    violet: "#a855f7",
    text: "#f4f7fb",
    muted: "#9ca3af",
    soft: "#d1d5db",
    ink: "#050507",
  },
  type: {
    family: "var(--font-sans), Arial, Helvetica, sans-serif",
    displayTracking: "-0.04em",
    bodySize: "1rem",
    displaySizes: { sm: "2rem", md: "3rem", lg: "4.5rem" },
  },
  space: { xs: 8, sm: 12, md: 16, lg: 24, xl: 40, section: 128 },
  radius: { sm: 12, md: 20, lg: 28, full: 999 },
  motion: {
    fast: 0.15,
    base: 0.18,
    slow: 0.32,
    easeOut: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
  brand: {
    mark: "ALTIVOXAI",
    motif: "neural-orbit",
    guarantee: "Chatbot en 7 días · Precio cerrado · Primera llamada gratis",
  },
} as const;

export const motionRules = {
  hoverLift: "translateY(-2px) + border cyan",
  reveal: "opacity + y with scrub on desktop only",
  reducedMotion: "disable parallax, keep opacity fades ≤120ms",
  pageIntro: "max 1.4s, once per session",
} as const;
