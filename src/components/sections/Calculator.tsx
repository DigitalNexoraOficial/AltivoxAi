"use client";

import { FormEvent, useMemo, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";
import { playTone } from "@/lib/sound";

async function postLead(payload: Record<string, unknown>) {
  const res = await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

function buildReportHtml(hours: number, savings: number, email: string) {
  return `<!doctype html><html><head><meta charset="utf-8"/><title>Informe ROI Altivox AI</title>
  <style>
  body{font-family:Arial,Helvetica,sans-serif;background:#050505;color:#fff;padding:40px}
  .card{border:1px solid rgba(34,211,238,.35);border-radius:24px;padding:28px;background:#0c0c0e}
  h1{font-size:28px;margin:0 0 8px} .muted{color:#9ca3af} .big{font-size:48px;color:#22d3ee;margin:12px 0}
  </style></head><body><div class="card">
  <p class="muted">Altivox AI · Informe ROI</p>
  <h1>Ahorro estimado mensual</h1>
  <p class="big">${savings.toLocaleString("es-ES")} €</p>
  <p class="muted">Horas/mes: ${hours} · Modelo 60€/h · Email: ${email}</p>
  <p>Próximo paso: piloto de chatbot en 7 días con precio cerrado.</p>
  </div></body></html>`;
}

export function Calculator() {
  const { t } = useI18n();
  const [hours, setHours] = useState(20);
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const savings = hours * 60;
  const yearly = useMemo(() => savings * 12, [savings]);

  function downloadReport() {
    const html = buildReportHtml(hours, savings, email || "lead@altivoxai.es");
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Informe-ROI-AltivoxAI.html";
    a.click();
    URL.revokeObjectURL(url);
    playTone("success");
  }

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
      setShowReport(true);
      downloadReport();
      playTone("success");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="calculator" className="section-shell">
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        <Reveal>
          <div className="ref-card-strong ui-lift">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
              <div>
                <span className="eyebrow">{t.calc.eyebrow}</span>
                <h2 className="heading-display mt-5 text-3xl md:text-5xl">{t.calc.title}</h2>
                <p className="mt-3 text-sm text-mist-muted md:text-base">{t.calc.sub}</p>

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
                  <span className="text-2xl font-semibold text-cyan">{hours}h</span>
                </div>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-black/35 p-6">
                <p className="text-[11px] uppercase tracking-widest text-mist-muted">{t.calc.savings}</p>
                <p className="mt-2 text-5xl font-semibold text-white">{savings.toLocaleString("es-ES")} €</p>
                <p className="mt-2 text-xs text-mist">Anual estimado: {yearly.toLocaleString("es-ES")} €</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="kpi-pill">ROI Snapshot</span>
                  <span className="kpi-pill">Informe visual</span>
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
                className="flex-1 rounded-full border border-white/15 bg-black/40 px-5 py-3.5 text-sm text-white outline-none focus:border-cyan"
              />
              <button type="submit" disabled={loading} className="btn-primary ui-lift">
                {loading ? "..." : "Generar informe ROI"}
              </button>
            </form>
            {ok ? <p className="mt-4 font-mono text-[11px] text-cyan">{t.calc.success}</p> : null}
            {showReport ? (
              <div className="mt-5 rounded-2xl border border-cyan/25 bg-cyan/10 p-4">
                <p className="text-sm text-white">Informe visual listo. También puedes volver a descargarlo.</p>
                <button type="button" className="btn-ghost ui-lift mt-3 !px-4 !py-2 text-xs" onClick={downloadReport}>
                  Descargar otra vez
                </button>
              </div>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
