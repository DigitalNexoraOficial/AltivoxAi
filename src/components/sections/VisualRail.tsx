"use client";

import { Reveal } from "@/components/ui/Reveal";

const tabs = ["Discover", "Automation", "Branding", "Product", "Web", "Ops"];

export function VisualRail() {
  return (
    <section className="section-shell -mt-8 pt-10 md:-mt-14 md:pt-14" aria-label="showcase rail">
      <div className="content-wrap">
        <Reveal>
          <div className="ref-card-strong ui-lift relative">
            <div className="pointer-events-none absolute -left-24 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-violet/25 blur-[88px]" />
            <div className="pointer-events-none absolute -right-14 top-10 h-40 w-40 rounded-full bg-cyan/20 blur-[82px]" />
            <div className="flex flex-wrap items-center gap-2">
              {tabs.map((tab, i) => (
                <button
                  key={tab}
                  type="button"
                  className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-widest transition ${
                    i === 0 ? "border-cyan/40 bg-cyan/15 text-cyan" : "border-white/10 text-mist-muted hover:border-white/20"
                  }`}
                >
                  {tab}
                </button>
              ))}
              <span className="ml-auto text-[10px] uppercase tracking-widest text-cyan">Altivox AI / Studio Mode</span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-12">
              <article className="card-surface md:col-span-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-cyan">System 01</p>
                <h3 className="mt-2 font-display text-lg uppercase text-white">Lead capture</h3>
                <p className="mt-2 text-xs leading-relaxed text-mist">Formularios, chat y guía conectados al pipeline comercial en tiempo real.</p>
              </article>
              <article className="card-surface md:col-span-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-cyan">System 02</p>
                <h3 className="mt-2 font-display text-lg uppercase text-white">Smart routing</h3>
                <p className="mt-2 text-xs leading-relaxed text-mist">Clasificación automática y handoff humano sin pérdida de contexto.</p>
              </article>
              <article className="card-surface md:col-span-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-cyan">System 03</p>
                <h3 className="mt-2 font-display text-lg uppercase text-white">Ops dashboard</h3>
                <p className="mt-2 text-xs leading-relaxed text-mist">Panel y automatizaciones para operar con criterios de agencia premium.</p>
              </article>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
