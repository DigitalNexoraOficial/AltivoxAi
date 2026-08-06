"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";
import { playTone } from "@/lib/sound";

const samples: Record<string, string> = {
  code: `// ALTIVOX LIVE DEMO — qualifyLead
export async function qualifyLead(payload) {
  const score = await scoreIntent(payload.message);
  if (score >= 70) return routeToSales(payload);
  return nurtureSequence(payload);
}`,
  script: `// ALTIVOX LIVE DEMO — Guion comercial
Hook: "¿Cuántas horas pierdes al mes en leads fríos?"
Promesa: piloto chatbot en 7 días, precio cerrado.
CTA: agenda llamada gratis de 15 minutos.`,
  ecom: `// ALTIVOX LIVE DEMO — E-Commerce Agent
Agent: recomienda productos, resuelve FAQs,
escala incidencias de pago al humano,
sincroniza pedidos con el panel ops.`,
};

export function Simulator() {
  const { t } = useI18n();
  const [mode, setMode] = useState<"code" | "script" | "ecom" | null>(null);
  const [text, setText] = useState(t.sim.idle);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!mode) {
      setText(t.sim.idle);
      setDone(false);
      return;
    }
    const full = samples[mode];
    let i = 0;
    setText("");
    setDone(false);
    const id = window.setInterval(() => {
      i += 3;
      setText(full.slice(0, i));
      if (i >= full.length) {
        window.clearInterval(id);
        setDone(true);
        playTone("success");
      }
    }, 14);
    return () => window.clearInterval(id);
  }, [mode, t.sim.idle]);

  return (
    <section id="simulator" className="section-shell section-light">
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        <Reveal>
          <div className="ref-card-strong ui-lift">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="step-num">{t.sim.eyebrow} · Live Demo</p>
                <h2 className="heading-display mt-2 text-3xl md:text-4xl">{t.sim.title}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-ghost ui-lift !px-4 !py-2" onClick={() => { setMode("code"); playTone("click"); }}>{t.sim.btnCode}</button>
                <button type="button" className="btn-ghost ui-lift !px-4 !py-2" onClick={() => { setMode("script"); playTone("click"); }}>{t.sim.btnScript}</button>
                <button type="button" className="btn-ghost ui-lift !px-4 !py-2" onClick={() => { setMode("ecom"); playTone("click"); }}>{t.sim.btnEcom}</button>
              </div>
            </div>
            <pre className="mt-8 min-h-[210px] overflow-auto rounded-[1.5rem] border border-cyan/20 bg-black/55 p-5 font-mono text-[11px] leading-relaxed text-cyan/90">
              {text}
            </pre>
            {done ? (
              <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-cyan/25 bg-cyan/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-white">Demo lista. El siguiente paso es un piloto real en 7 días.</p>
                <a href="#contact" className="btn-primary ui-lift !px-4 !py-2 text-xs" onClick={() => playTone("click")}>
                  Pedir piloto →
                </a>
              </div>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
