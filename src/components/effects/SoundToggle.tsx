"use client";

import { useEffect, useState } from "react";
import { isSoundEnabled, playTone, setSoundEnabled } from "@/lib/sound";

export function SoundToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(isSoundEnabled());
  }, []);

  return (
    <button
      type="button"
      className="fixed bottom-6 left-6 z-[95] rounded-full border border-white/15 bg-black/50 px-3 py-2 text-[10px] uppercase tracking-widest text-mist-muted backdrop-blur hover:text-cyan"
      aria-pressed={on}
      aria-label={on ? "Desactivar sonido" : "Activar sonido"}
      onClick={() => {
        const next = !on;
        setSoundEnabled(next);
        setOn(next);
        if (next) playTone("click");
      }}
    >
      Sound {on ? "On" : "Off"}
    </button>
  );
}
