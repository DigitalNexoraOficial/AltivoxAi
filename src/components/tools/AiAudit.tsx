"use client";

import { FormEvent, useMemo, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { playTone } from "@/lib/sound";
import { trackEvent } from "@/lib/ab";

type Answers = {
  leads: number;
  responseHours: number;
  channels: number;
};

function scoreAudit(a: Answers) {
  let score = 40;
  if (a.leads >= 40) score += 15;
  if (a.responseHours > 4) score += 20;
  if (a.channels >= 2) score += 15;
  if (a.responseHours > 12) score += 10;
  return Math.min(score, 98);
}

function planFor(score: number) {
  if (score >= 75) return { name: "Piloto 7 días", focus: "Chatbot + routing + alertas", cta: "#ofertas" };
  if (score >= 55) return { name: "Automatización de leads", focus: "Captura + score + seguimiento", cta: "#calculator" };
  return { name: "Diagnóstico guiado", focus: "Llamada gratis + mapa de fricción", cta: "#contact" };
}

export function AiAudit() {
  const [answers, setAnswers] = useState<Answers>({ leads: 20, responseHours: 8, channels: 1 });
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const score = useMemo(() => scoreAudit(answers), [answers]);
  const plan = useMemo(() => planFor(score), [score]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    trackEvent("ai_audit_submit", { score: String(score), plan: plan.name });
    await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: "Auditoría IA",
        email,
        mensaje: `Audit score ${score}. Leads/mes ${answers.leads}. Respuesta ${answers.responseHours}h. Canales ${answers.channels}. Plan: ${plan.name}`,
        tipo_interes: "Auditoría IA",
        fuente: "audit",
        score: Math.min(90, score),
        clasificacion: score >= 70 ? "caliente" : "templado",
        prioridad: score >= 70 ? "alta" : "media",
        estado: "nuevo",
      }),
    });
    setDone(true);
    playTone("success");
  }

  return (
    <section id="auditoria" className="section-shell" data-story>
      <div className="content-wrap">
        <Reveal>
          <div className="ref-card">
            <p className="step-num">Herramienta · Auditoría IA gratuita</p>
            <h2 className="heading-display mt-3 text-3xl md:text-5xl">¿Cuánto te está costando no automatizar?</h2>
            <p className="mt-3 max-w-2xl text-sm text-mist-muted">Score + plan recomendado en 30 segundos. Sin compromiso.</p>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <form onSubmit={onSubmit} className="space-y-5">
                <label className="block text-xs uppercase tracking-widest text-mist-muted">
                  Leads/mes aproximados
                  <input type="range" min={5} max={200} value={answers.leads} onChange={(e) => setAnswers((s) => ({ ...s, leads: Number(e.target.value) }))} className="mt-2 w-full accent-cyan" />
                  <span className="mt-1 inline-block text-cyan">{answers.leads}</span>
                </label>
                <label className="block text-xs uppercase tracking-widest text-mist-muted">
                  Horas hasta primera respuesta
                  <input type="range" min={1} max={48} value={answers.responseHours} onChange={(e) => setAnswers((s) => ({ ...s, responseHours: Number(e.target.value) }))} className="mt-2 w-full accent-cyan" />
                  <span className="mt-1 inline-block text-cyan">{answers.responseHours}h</span>
                </label>
                <label className="block text-xs uppercase tracking-widest text-mist-muted">
                  Canales activos (web/wa/email…)
                  <input type="range" min={1} max={5} value={answers.channels} onChange={(e) => setAnswers((s) => ({ ...s, channels: Number(e.target.value) }))} className="mt-2 w-full accent-cyan" />
                  <span className="mt-1 inline-block text-cyan">{answers.channels}</span>
                </label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Tu email para recibir el plan" className="w-full rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm outline-none focus:border-cyan" />
                <button type="submit" className="btn-primary ui-lift w-full sm:w-auto">Obtener plan →</button>
              </form>

              <div className="rounded-[1.5rem] border border-cyan/25 bg-cyan/10 p-6">
                <p className="text-[10px] uppercase tracking-widest text-cyan">Score</p>
                <p className="mt-2 text-5xl font-semibold text-white">{score}</p>
                <p className="mt-4 text-lg font-semibold text-white">{plan.name}</p>
                <p className="mt-2 text-sm text-mist-muted">{plan.focus}</p>
                {done ? <a href={plan.cta} className="btn-ghost ui-lift mt-6 inline-flex">Ver siguiente paso →</a> : null}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
