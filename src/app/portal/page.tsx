"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const DEMO = {
  project: "Piloto Chatbot · Retail Norte",
  day: 4,
  total: 7,
  tasks: [
    { name: "Brief + FAQs", done: true },
    { name: "Entrenamiento agente", done: true },
    { name: "Integración lead API", done: true },
    { name: "QA conversacional", done: false },
    { name: "Go-live", done: false },
  ],
};

export default function PortalPage() {
  const [tab, setTab] = useState<"estado" | "entregables" | "chat">("estado");
  const progress = useMemo(() => Math.round((DEMO.day / DEMO.total) * 100), []);

  return (
    <main className="relative z-10 mx-auto min-h-[100svh] max-w-5xl px-6 py-24">
      <p className="step-num">Portal cliente · demo</p>
      <h1 className="heading-display mt-4 text-4xl md:text-6xl">Tu piloto, transparente</h1>
      <p className="mt-4 max-w-2xl text-mist-muted">Vista demo sin datos sensibles. En producción se conecta a tu proyecto real.</p>

      <div className="mt-8 flex flex-wrap gap-2">
        {[
          ["estado", "Estado"],
          ["entregables", "Entregables"],
          ["chat", "Chat"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id as typeof tab)}
            className={`rounded-full border px-4 py-2 text-xs uppercase tracking-widest ${tab === id ? "border-cyan/50 bg-cyan/15 text-cyan" : "border-white/10 text-mist-muted"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="ref-card mt-8">
        {tab === "estado" ? (
          <>
            <p className="font-semibold text-white">{DEMO.project}</p>
            <p className="mt-2 text-sm text-mist-muted">Día {DEMO.day} de {DEMO.total}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full rounded-full bg-gradient-to-r from-cyan to-violet" style={{ width: `${progress}%` }} />
            </div>
            <ul className="mt-6 space-y-2">
              {DEMO.tasks.map((t) => (
                <li key={t.name} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-sm">
                  <span className="text-soft">{t.name}</span>
                  <span className={t.done ? "text-cyan" : "text-mist-muted"}>{t.done ? "Listo" : "Pendiente"}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {tab === "entregables" ? (
          <ul className="space-y-3 text-sm text-soft">
            <li className="rounded-xl border border-white/10 p-3">Script conversacional v1</li>
            <li className="rounded-xl border border-white/10 p-3">Mapa de escalado humano</li>
            <li className="rounded-xl border border-white/10 p-3">Conexión /api/lead</li>
          </ul>
        ) : null}

        {tab === "chat" ? (
          <div className="space-y-3 text-sm">
            <p className="rounded-2xl bg-white/5 px-3 py-2 text-soft">Equipo Altivox: QA en curso. Mañana revisamos go-live.</p>
            <p className="ml-auto max-w-[80%] rounded-2xl bg-cyan/15 px-3 py-2 text-cyan">Perfecto, gracias.</p>
          </div>
        ) : null}
      </div>

      <Link href="/" className="btn-ghost ui-lift mt-8 inline-flex">Volver al sitio</Link>
    </main>
  );
}
