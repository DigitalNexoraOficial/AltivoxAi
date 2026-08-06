"use client";

import { Reveal } from "@/components/ui/Reveal";

const COLUMNS = [
  {
    title: "Nuevos",
    items: ["Lead web · guía", "ROI calculator", "Booking 16:00"],
  },
  {
    title: "Calientes",
    items: ["Score 82 · WhatsApp", "Demo ecom lista", "Audit 91"],
  },
  {
    title: "En piloto",
    items: ["Retail Norte · día 4", "Clínica Atlas · setup"],
  },
];

export function CrmDemo() {
  return (
    <section id="crm-demo" className="section-shell section-light" data-story>
      <div className="content-wrap">
        <Reveal>
          <div className="ref-card">
            <p className="step-num">CRM visible · demo segura</p>
            <h2 className="heading-display mt-3 text-3xl md:text-5xl">Tu pipeline, en una sola capa</h2>
            <p className="mt-3 max-w-2xl text-sm text-mist-muted">
              Visualización demo sin datos reales de clientes. Así se ve el flujo Altivox Ops.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {COLUMNS.map((col) => (
                <div key={col.title} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-widest text-cyan">{col.title}</p>
                  <ul className="mt-4 space-y-3">
                    {col.items.map((item) => (
                      <li key={item} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-soft">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
