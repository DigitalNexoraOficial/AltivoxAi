"use client";

import { FormEvent, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/I18nProvider";
import { useSiteSettings } from "@/components/providers/SiteSettingsProvider";

export function Contact() {
  const { t } = useI18n();
  const site = useSiteSettings();
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const email = site.contact.email || "info@altivoxai.es";
  const wa = site.contact.whatsapp || "34633906519";
  const waLabel = site.contact.whatsappLabel || t.contact.waLink;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nombre = String(fd.get("nombre") || "").trim();
    const mail = String(fd.get("email") || "").trim();
    const empresa = String(fd.get("empresa") || "").trim();
    const mensaje = String(fd.get("mensaje") || "").trim();
    if (!mail.includes("@") || !nombre || !mensaje) return;
    setLoading(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          email: mail,
          empresa,
          mensaje,
          tipo_interes: "Contacto web",
          fuente: "contacto",
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
          <h2 className="section-title mt-5">{t.contact.title}</h2>
          <p className="mt-4 max-w-md text-base text-mist-muted">{t.contact.sub}</p>
          <div className="mt-10 space-y-4 text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-widest text-mist-muted">{t.contact.emailLbl}</p>
              <a href={`mailto:${email}`} className="mt-1 inline-block text-cyan hover:underline">{email}</a>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-widest text-mist-muted">{t.contact.waLbl}</p>
              <a href={`https://wa.me/${wa}`} className="mt-1 inline-block text-white hover:text-cyan" target="_blank" rel="noopener noreferrer">{waLabel}</a>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-widest text-mist-muted">{t.contact.webLbl}</p>
              <a href="https://www.altivoxai.es" className="mt-1 inline-block text-white hover:text-cyan">www.altivoxai.es</a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <form onSubmit={onSubmit} className="ref-card-strong ui-lift space-y-4">
            <input name="nombre" required placeholder={t.contact.phName} className="w-full rounded-full border border-white/15 bg-black/40 px-5 py-3.5 text-sm outline-none focus:border-cyan" />
            <input name="email" type="email" required placeholder={t.contact.phEmail} className="w-full rounded-full border border-white/15 bg-black/40 px-5 py-3.5 text-sm outline-none focus:border-cyan" />
            <input name="empresa" placeholder={t.contact.phCompany} className="w-full rounded-full border border-white/15 bg-black/40 px-5 py-3.5 text-sm outline-none focus:border-cyan" />
            <textarea name="mensaje" required rows={4} placeholder={t.contact.phMessage} className="w-full rounded-3xl border border-white/15 bg-black/40 px-5 py-3.5 text-sm outline-none focus:border-cyan" />
            <button type="submit" disabled={loading} className="btn-primary ui-lift w-full">
              {loading ? "..." : `${t.contact.btn} →`}
            </button>
            {ok ? <p className="font-mono text-[11px] text-cyan">{t.contact.success}</p> : null}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
