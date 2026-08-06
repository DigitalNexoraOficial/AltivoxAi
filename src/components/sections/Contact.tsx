"use client";

import { FormEvent, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";

export function Contact() {
  const { t } = useI18n();
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nombre = String(fd.get("nombre") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const empresa = String(fd.get("empresa") || "").trim();
    const mensaje = String(fd.get("mensaje") || "").trim();
    if (!email.includes("@") || !nombre || !mensaje) return;
    setLoading(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          email,
          empresa,
          mensaje,
          tipo_interes: "Contacto web",
          fuente: "contacto",
          score: 65,
          clasificacion: "templado",
          prioridad: "alta",
          estado: "nuevo",
        }),
      });
      setOk(true);
      e.currentTarget.reset();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contact" className="section-shell">
      <div className="content-wrap grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <span className="eyebrow">{t.contact.eyebrow}</span>
          <h2 className="heading-display mt-5 text-3xl md:text-5xl">{t.contact.title}</h2>
          <p className="mt-4 max-w-md text-sm text-mist">{t.contact.sub}</p>
          <div className="mt-10 space-y-6 text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-widest text-mist-muted">{t.contact.emailLbl}</p>
              <a href="mailto:info@altivoxai.es" className="mt-1 inline-block text-cyan hover:underline">info@altivoxai.es</a>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-widest text-mist-muted">{t.contact.waLbl}</p>
              <a href="https://wa.me/34600000000" className="mt-1 inline-block text-white hover:text-cyan" target="_blank" rel="noopener noreferrer">{t.contact.waLink}</a>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-widest text-mist-muted">{t.contact.webLbl}</p>
              <a href="https://www.altivoxai.es" className="mt-1 inline-block text-white hover:text-cyan">www.altivoxai.es</a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <form onSubmit={onSubmit} className="ref-card-strong ui-lift space-y-4">
            <input name="nombre" required placeholder={t.contact.phName} className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm outline-none focus:border-cyan" />
            <input name="email" type="email" required placeholder={t.contact.phEmail} className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm outline-none focus:border-cyan" />
            <input name="empresa" placeholder={t.contact.phCompany} className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm outline-none focus:border-cyan" />
            <textarea name="mensaje" required rows={4} placeholder={t.contact.phMessage} className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm outline-none focus:border-cyan" />
            <button type="submit" disabled={loading} className="btn-primary ui-lift w-full">
              {loading ? "..." : t.contact.btn}
            </button>
            {ok ? <p className="font-mono text-[11px] text-cyan">{t.contact.success}</p> : null}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
