"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { playTone } from "@/lib/sound";

const STEPS = [
  { id: "home", title: "Hero", text: "Tu propuesta de valor en 3 segundos." },
  { id: "services", title: "Ecosistema", text: "Servicios de IA listos para operar." },
  { id: "ofertas", title: "Ofertas", text: "Precios cerrados, sin letra pequeña." },
  { id: "casestudies", title: "Casos", text: "Resultados medibles de clientes reales." },
  { id: "calculator", title: "ROI", text: "Calcula el ahorro antes de decidir." },
  { id: "contact", title: "Contacto", text: "Agenda una llamada gratis ahora." },
];

export function StudioTour() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!open) return;
    const target = document.getElementById(STEPS[step].id);
    target?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    playTone("whoosh");
  }, [open, step, reduce]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setStep(0);
          playTone("click");
        }}
        className="fixed right-6 top-24 z-[95] hidden rounded-full border border-cyan/30 bg-cyan/10 px-3 py-2 text-[10px] uppercase tracking-widest text-cyan backdrop-blur md:inline-flex"
      >
        Studio Tour
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="hero-dock fixed bottom-24 left-1/2 z-[120] w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 rounded-[1.5rem] border border-cyan/25 p-5"
            role="dialog"
            aria-modal="true"
            aria-label="Studio Tour"
          >
            <p className="step-num">
              Tour {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">{STEPS[step].title}</h3>
            <p className="mt-2 text-sm text-mist-muted">{STEPS[step].text}</p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                className="btn-ghost !px-4 !py-2 text-xs"
                onClick={() => {
                  if (step === 0) setOpen(false);
                  else setStep((s) => s - 1);
                }}
              >
                {step === 0 ? "Cerrar" : "Anterior"}
              </button>
              <button
                type="button"
                className="btn-primary !px-4 !py-2 text-xs"
                onClick={() => {
                  if (step >= STEPS.length - 1) {
                    setOpen(false);
                    playTone("success");
                  } else setStep((s) => s + 1);
                }}
              >
                {step >= STEPS.length - 1 ? "Terminar" : "Siguiente →"}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
