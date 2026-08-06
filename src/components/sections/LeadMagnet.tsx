"use client";

import { FormEvent, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";

const PDF = "/assets/guia/Guia-Basica-Automatizacion-IA-AltivoxAi.pdf";

export function LeadMagnet() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  function downloadPdf() {
    fetch(PDF)
      .then((r) => {
        if (!r.ok) throw new Error("pdf");
        return r.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Guia-Basica-Automatizacion-IA-AltivoxAi.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      })
      .catch(() => window.open(PDF, "_blank", "noopener"));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setLoading(true);
    downloadPdf();
    setOk(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: "Guía IA",
          email,
          mensaje: "Descarga guía básica de automatización con IA desde altivoxai.es",
          tipo_interes: "Guía Básica IA",
          fuente: "guia",
          score: 55,
          clasificacion: "templado",
          prioridad: "media",
          estado: "nuevo",
        }),
        keepalive: true,
      });
      setEmail("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="leadmagnet" className="section-pad">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-[2rem] border-cyan/30 p-8 md:p-12">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan/15 blur-[90px]" />
            <div className="relative grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
              <div>
                <span className="eyebrow">{t.lead.eyebrow}</span>
                <h2 className="heading-display mt-5 text-2xl md:text-4xl">
                  {t.lead.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-mist">
                  {t.lead.desc}
                </p>
              </div>
              <form onSubmit={onSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.lead.placeholder}
                  className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan"
                />
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? "..." : t.lead.btn}
                </button>
                {ok ? (
                  <p className="text-center font-mono text-[11px] text-cyan">
                    {t.lead.success}{" "}
                    <a href={PDF} target="_blank" rel="noopener" className="underline">
                      {t.lead.openPdf}
                    </a>
                  </p>
                ) : null}
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
