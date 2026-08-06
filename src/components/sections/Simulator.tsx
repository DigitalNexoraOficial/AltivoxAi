"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";

const samples: Record<string, string> = {
  code: `// ALTIVOX CORE — Generador de Código
export async function qualifyLead(payload) {
  const score = await scoreIntent(payload.message);
  if (score >= 70) return routeToSales(payload);
  return nurtureSequence(payload);
}`,
  script: `// ALTIVOX CORE — Guion comercial
Hook: "¿Cuántas horas pierdes al mes en leads fríos?"
Promesa: piloto chatbot en 7 días, precio cerrado.
CTA: agenda llamada gratis de 15 minutos.`,
  ecom: `// ALTIVOX CORE — E-Commerce
Agent: recomienda productos, resuelve FAQs,
escala incidencias de pago al humano,
sincroniza pedidos con el panel ops.`,
};

export function Simulator() {
  const { t } = useI18n();
  const [mode, setMode] = useState<"code" | "script" | "ecom" | null>(null);
  const [text, setText] = useState(t.sim.idle);

  useEffect(() => {
    if (!mode) {
      setText(t.sim.idle);
      return;
    }
    const full = samples[mode];
    let i = 0;
    setText("");
    const id = window.setInterval(() => {
      i += 2;
      setText(full.slice(0, i));
      if (i >= full.length) window.clearInterval(id);
    }, 16);
    return () => window.clearInterval(id);
  }, [mode, t.sim.idle]);

  return (
    <section id="simulator" className="section-pad">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div className="glass rounded-[2rem] p-6 md:p-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-cyan">
                  {t.sim.eyebrow}
                </p>
                <h2 className="heading-display mt-2 text-2xl md:text-3xl">
                  {t.sim.title}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-ghost !px-3 !py-2" onClick={() => setMode("code")}>
                  {t.sim.btnCode}
                </button>
                <button type="button" className="btn-ghost !px-3 !py-2" onClick={() => setMode("script")}>
                  {t.sim.btnScript}
                </button>
                <button type="button" className="btn-ghost !px-3 !py-2" onClick={() => setMode("ecom")}>
                  {t.sim.btnEcom}
                </button>
              </div>
            </div>
            <pre className="mt-8 min-h-[180px] overflow-auto rounded-2xl border border-white/10 bg-black/50 p-5 font-mono text-[11px] leading-relaxed text-cyan/90">
              {text}
            </pre>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
