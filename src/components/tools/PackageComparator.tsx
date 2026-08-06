"use client";

import { useMemo, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";

const FEATURES = [
  { key: "chatbot", label: "Chatbot web" },
  { key: "routing", label: "Routing de leads" },
  { key: "wa", label: "WhatsApp" },
  { key: "panel", label: "Panel ops" },
  { key: "support", label: "Soporte prioritario" },
] as const;

export function PackageComparator() {
  const { t } = useI18n();
  const [selected, setSelected] = useState(1);

  const matrix = useMemo(
    () => [
      { chatbot: true, routing: false, wa: false, panel: false, support: false },
      { chatbot: true, routing: true, wa: true, panel: true, support: false },
      { chatbot: true, routing: true, wa: true, panel: true, support: true },
    ],
    []
  );

  return (
    <section id="comparador" className="section-shell" data-story>
      <div className="content-wrap">
        <Reveal className="text-center">
          <p className="step-num">Comparador interactivo</p>
          <h2 className="section-title mt-3">Elige con claridad</h2>
          <p className="mx-auto section-sub">Compara paquetes sin letra pequeña. Precio cerrado.</p>
        </Reveal>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="p-3 text-mist-muted">Capacidad</th>
                {t.offers.items.map((offer, i) => (
                  <th key={offer.title} className="p-3">
                    <button
                      type="button"
                      onClick={() => setSelected(i)}
                      className={`w-full rounded-2xl border px-3 py-3 text-left ${selected === i ? "border-cyan/50 bg-cyan/10" : "border-white/10"}`}
                    >
                      <p className="font-semibold text-white">{offer.title}</p>
                      <p className="mt-1 text-cyan">{offer.price}</p>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((f) => (
                <tr key={f.key} className="border-t border-white/10">
                  <td className="p-3 text-mist-muted">{f.label}</td>
                  {matrix.map((row, i) => (
                    <td key={`${f.key}-${i}`} className="p-3 text-center text-white">
                      {row[f.key] ? "✓" : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center">
          <a href="#contact" className="btn-primary ui-lift">
            Quiero el paquete {t.offers.items[selected]?.title} →
          </a>
        </div>
      </div>
    </section>
  );
}
