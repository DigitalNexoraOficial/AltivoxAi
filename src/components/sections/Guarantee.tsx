"use client";

import { Reveal } from "@/components/ui/Reveal";
import { tokens } from "@/lib/brand-system";

export function Guarantee() {
  return (
    <section id="garantia" className="section-shell" data-story>
      <div className="content-wrap">
        <Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["7 días", "Chatbot operativo en una semana"],
              ["Precio cerrado", "Sin sorpresas ni scope infinito"],
              ["Llamada gratis", "15 minutos para decidir con claridad"],
            ].map(([title, text]) => (
              <article key={title} className="ref-card ui-lift">
                <p className="step-num">Garantía visual</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm text-mist-muted">{text}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-mist-muted">{tokens.brand.guarantee}</p>
        </Reveal>
      </div>
    </section>
  );
}
