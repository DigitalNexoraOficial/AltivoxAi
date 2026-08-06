"use client";

import { Reveal } from "@/components/ui/Reveal";

const steps = [
  { id: "01", label: "Discover", title: "Diagnóstico", text: "Detectamos fricciones comerciales y oportunidades de automatización." },
  { id: "02", label: "Build", title: "Automatiza", text: "Chatbots, capturas y routing conectados a tu pipeline real." },
  { id: "03", label: "Scale", title: "Opera", text: "Panel, agentes y seguimiento 24/7 con criterios de agencia." },
  { id: "04", label: "Earn", title: "Convierte", text: "Más leads cualificados y menos trabajo manual desde el día uno." },
];

export function VisualRail() {
  return (
    <section className="section-shell -mt-4 pt-8 md:pt-12" aria-label="process rail">
      <div className="content-wrap">
        <Reveal>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="step-num">Scroll to explore</p>
              <h2 className="heading-serif mt-3 text-3xl md:text-5xl">Learn. Build. Automate. Earn.</h2>
            </div>
            <span className="eyebrow">
              <span className="live-dot" />
              Altivox AI / Studio Mode
            </span>
          </div>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal key={step.id} delay={i * 0.06}>
              <article className="ref-card ui-lift h-full">
                <p className="step-num">{step.id} — {step.label}</p>
                <h3 className="mt-4 font-serif text-2xl text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mist-muted">{step.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
