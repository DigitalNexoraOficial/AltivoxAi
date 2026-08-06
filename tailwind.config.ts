import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#050507",
          50: "#0a0c12",
          100: "#070b14",
          200: "#0d1522",
          300: "#0f172a",
        },
        cyan: {
          DEFAULT: "#22d3ee",
          dim: "rgba(34, 211, 238, 0.14)",
          glow: "rgba(34, 211, 238, 0.45)",
          deep: "#0284c7",
        },
        violet: {
          DEFAULT: "#a855f7",
          soft: "rgba(168, 85, 247, 0.35)",
        },
        mist: {
          DEFAULT: "#c5ced9",
          muted: "#9fb0c3",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        glass: "0 20px 60px rgba(0,0,0,0.45)",
        glow: "0 0 40px rgba(34, 211, 238, 0.25)",
        "glow-lg": "0 0 80px rgba(34, 211, 238, 0.2)",
      },
      backgroundImage: {
        "hero-mesh":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,211,238,0.22), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(168,85,247,0.12), transparent 50%), radial-gradient(ellipse 50% 40% at 0% 100%, rgba(2,132,199,0.1), transparent 45%)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "pulse-soft": "pulseSoft 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
