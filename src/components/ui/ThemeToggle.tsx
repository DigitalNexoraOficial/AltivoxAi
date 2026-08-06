"use client";

import { useTheme } from "@/components/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] uppercase tracking-widest text-mist-muted transition hover:border-cyan/40 hover:text-cyan"
      aria-label={theme === "dark" ? "Activar tema claro" : "Activar tema oscuro"}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
