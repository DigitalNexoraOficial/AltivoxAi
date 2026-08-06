"use client";

import { useMemo, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { playTone } from "@/lib/sound";
import { trackEvent } from "@/lib/ab";

const QUESTIONS = [
  {
    q: "¿Qué te duele más ahora?",
    options: [
      { id: "speed", label: "Respondo tarde a los leads", result: "chatbot" },
      { id: "quality", label: "Llegan leads poco cualificados", result: "routing" },
      { id: "sales", label: "Quiero vender más por chat", result: "sales" },
    ],
  },
  {
    q: "¿Dónde hablan contigo tus clientes?",
    options: [
      { id: "web", label: "Web", result: "chatbot" },
      { id: "wa", label: "WhatsApp", result: "routing" },
      { id: "mix", label: "Varios canales", result: "ops" },
    ],
  },
  {
    q: "¿Qué ritmo quieres?",
    options: [
      { id: "fast", label: "Piloto en 7 días", result: "chatbot" },
      { id: "scale", label: "Sistema completo", result: "ops" },
      { id: "learn", label: "Empezar con guía + llamada", result: "guide" },
    ],
  },
];

const RESULTS: Record<string, { title: string; text: string; href: string }> = {
  chatbot: { title: "Chatbot + piloto 7 días", text: "Ideal para responder ya y cualificar sin ampliar equipo.", href: "#ofertas" },
  routing: { title: "Automatización de leads", text: "Score, alertas y seguimiento para que ventas solo entre en calientes.", href: "#calculator" },
  sales: { title: "Agente comercial conversacional", text: "Recomendaciones, objeciones y handoff humano cuando convierte.", href: "#simulator" },
  ops: { title: "AI Agency OS", text: "Capa operativa completa: captura, routing y panel.", href: "#services" },
  guide: { title: "Guía + llamada estratégica", text: "Empieza con diagnóstico y material práctico.", href: "#leadmagnet" },
};

export function NeedsQuiz() {
  const [step, setStep] = useState(0);
  const [votes, setVotes] = useState<string[]>([]);
  const done = step >= QUESTIONS.length;

  const winner = useMemo(() => {
    const count: Record<string, number> = {};
    votes.forEach((v) => {
      count[v] = (count[v] || 0) + 1;
    });
    return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] || "chatbot";
  }, [votes]);

  const result = RESULTS[winner];

  return (
    <section id="quiz" className="section-shell section-light" data-story>
      <div className="content-wrap max-w-3xl">
        <Reveal>
          <div className="ref-card">
            <p className="step-num">Quiz · ¿Qué sistema necesitas?</p>
            <h2 className="heading-display mt-3 text-3xl md:text-4xl">3 preguntas. 1 recomendación clara.</h2>

            {!done ? (
              <div className="mt-8">
                <p className="text-lg font-semibold text-white">{QUESTIONS[step].q}</p>
                <div className="mt-5 grid gap-3">
                  {QUESTIONS[step].options.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-left text-sm text-mist hover:border-cyan/40 hover:text-white"
                      onClick={() => {
                        setVotes((v) => [...v, opt.result]);
                        setStep((s) => s + 1);
                        playTone("click");
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-cyan/25 bg-cyan/10 p-5">
                <p className="text-cyan text-xs uppercase tracking-widest">Recomendación</p>
                <p className="mt-2 text-2xl font-semibold text-white">{result.title}</p>
                <p className="mt-2 text-sm text-mist-muted">{result.text}</p>
                <a
                  href={result.href}
                  className="btn-primary ui-lift mt-5 inline-flex"
                  onClick={() => trackEvent("quiz_result", { winner })}
                >
                  Ver solución →
                </a>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
