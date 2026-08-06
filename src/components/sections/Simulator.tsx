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
    <section id="simulator" className="section-shell">
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        <Reveal>
          <div className="ref-card-strong ui-lift">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="step-num">{t.sim.eyebrow}</p>
                <h2 className="heading-serif mt-2 text-3xl md:text-4xl">{t.sim.title}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-ghost ui-lift !px-4 !py-2" onClick={() => setMode("code")}>{t.sim.btnCode}</button>
                <button type="button" className="btn-ghost ui-lift !px-4 !py-2" onClick={() => setMode("script")}>{t.sim.btnScript}</button>
                <button type="button" className="btn-ghost ui-lift !px-4 !py-2" onClick={() => setMode("ecom")}>{t.sim.btnEcom}</button>
              </div>
            </div>
            <pre className="mt-8 min-h-[210px] overflow-auto rounded-[1.5rem] border border-cyan/20 bg-black/55 p-5 font-mono text-[11px] leading-relaxed text-cyan/90">
              {text}
            </pre>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
