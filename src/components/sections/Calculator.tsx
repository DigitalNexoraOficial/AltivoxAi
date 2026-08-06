"use client";

import { FormEvent, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";

async function postLead(payload: Record<string, unknown>) {
  const res = await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export function Calculator() {
  const { t } = useI18n();
  const [hours, setHours] = useState(20);
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const savings = hours * 60;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setLoading(true);
    try {
      await postLead({
        nombre: "Calculadora ROI",
        email,
        mensaje: `Solicitud informe ROI. Horas/mes: ${hours}. Ahorro estimado: ${savings}€`,
        tipo_interes: "Calculadora ROI",
        fuente: "calculadora",
        score: 50,
        clasificacion: "templado",
        prioridad: "media",
        estado: "nuevo",
      });
      setOk(true);
      setEmail("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="calculator" className="section-shell">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="ref-card-strong ui-lift">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
              <div>
                <span className="eyebrow">{t.calc.eyebrow}</span>
                <h2 className="heading-display mt-5 text-3xl md:text-4xl">{t.calc.title}</h2>
                <p className="mt-3 text-sm text-mist">{t.calc.sub}</p>

                <label className="mt-10 block text-[11px] uppercase tracking-widest text-mist-muted">{t.calc.hours}</label>
                <div className="mt-3 flex items-center gap-4">
                  <input
                    type="range"
                    min={5}
                    max={160}
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-full accent-cyan"
                    aria-label={t.calc.hours}
                  />
                  <span className="font-display text-xl text-cyan">{hours}h</span>
                </div>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-black/35 p-6">
                <p className="text-[11px] uppercase tracking-widest text-mist-muted">{t.calc.savings}</p>
                <p className="mt-2 font-display text-4xl text-white">{savings.toLocaleString("es-ES")} €</p>
                <p className="mt-2 text-xs text-mist">Modelo conservador basado en 60€/hora.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="kpi-pill">ROI Snapshot</span>
                  <span className="kpi-pill">Realtime</span>
                </div>
              </div>
            </div>

            <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.calc.placeholder}
                className="flex-1 rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan"
              />
              <button type="submit" disabled={loading} className="btn-primary ui-lift">
                {loading ? "..." : t.calc.btn}
              </button>
            </form>
            {ok ? <p className="mt-4 font-mono text-[11px] text-cyan">{t.calc.success}</p> : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
