"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { playTone } from "@/lib/sound";
import { trackEvent } from "@/lib/ab";

function nextDays(count: number) {
  const out: { label: string; value: string }[] = [];
  const base = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    out.push({
      value: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("es-ES", { weekday: "short", day: "2-digit", month: "short" }),
    });
    if (out.length >= count) break;
  }
  return out;
}

const SLOTS = ["10:00", "11:30", "13:00", "16:00", "17:30"];
const CAL_URL = process.env.NEXT_PUBLIC_CAL_URL || "";

export function BookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduce = useReducedMotion();
  const days = useMemo(() => nextDays(5), []);
  const [day, setDay] = useState(days[0]?.value || "");
  const [slot, setSlot] = useState(SLOTS[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"form" | "cal">(CAL_URL ? "cal" : "form");

  useEffect(() => {
    if (open) trackEvent("booking_open", { mode });
  }, [open, mode]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || !name.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: name.trim(),
          email,
          mensaje: `Reserva llamada: ${day} ${slot}`,
          tipo_interes: "Booking llamada",
          fuente: "booking",
          score: 75,
          clasificacion: "caliente",
          prioridad: "alta",
          estado: "nuevo",
        }),
      });
      setOk(true);
      playTone("success");
      trackEvent("booking_submit", { day, slot });
      if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(12);
      window.setTimeout(() => {
        onClose();
        window.location.href = `/bienvenida?nombre=${encodeURIComponent(name.trim())}&email=${encodeURIComponent(email)}`;
      }, 700);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={reduce ? false : { opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="hero-dock w-full max-w-lg rounded-[1.75rem] border border-cyan/25 p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Reservar llamada"
          >
            <p className="step-num">Booking</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Agenda tu llamada gratis</h3>
            <p className="mt-2 text-sm text-mist-muted">15 minutos. Sin compromiso. Confirmación inmediata.</p>

            {CAL_URL ? (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode("cal")}
                  className={`rounded-full border px-3 py-1.5 text-xs ${mode === "cal" ? "border-cyan/50 bg-cyan/15 text-cyan" : "border-white/10 text-mist-muted"}`}
                >
                  Calendario
                </button>
                <button
                  type="button"
                  onClick={() => setMode("form")}
                  className={`rounded-full border px-3 py-1.5 text-xs ${mode === "form" ? "border-cyan/50 bg-cyan/15 text-cyan" : "border-white/10 text-mist-muted"}`}
                >
                  Formulario rápido
                </button>
              </div>
            ) : null}

            {mode === "cal" && CAL_URL ? (
              <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
                <iframe
                  title="Calendario Altivox"
                  src={CAL_URL}
                  className="h-[420px] w-full bg-black"
                  loading="lazy"
                />
              </div>
            ) : (
              <form onSubmit={onSubmit}>
                <div className="mt-5 flex flex-wrap gap-2">
                  {days.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDay(d.value)}
                      className={`rounded-full border px-3 py-1.5 text-xs ${day === d.value ? "border-cyan/50 bg-cyan/15 text-cyan" : "border-white/10 text-mist-muted"}`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SLOTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlot(s)}
                      className={`rounded-full border px-3 py-1.5 text-xs ${slot === s ? "border-cyan/50 bg-cyan/15 text-cyan" : "border-white/10 text-mist-muted"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="mt-5 space-y-3">
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm outline-none focus:border-cyan"
                  />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Tu email"
                    className="w-full rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm outline-none focus:border-cyan"
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary ui-lift mt-5 w-full">
                  {loading ? "..." : ok ? "Confirmado ✓" : "Confirmar reserva →"}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function BookingTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        id="booking-trigger"
        className="btn-primary ui-lift"
        onClick={() => {
          setOpen(true);
          playTone("click");
        }}
      >
        Reservar llamada →
      </button>
      <BookingModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
