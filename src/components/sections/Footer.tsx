"use client";

import Image from "next/image";
import { useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";

export function Footer() {
  const { t } = useI18n();
  const [legal, setLegal] = useState(false);

  return (
    <footer className="border-t border-white/10 px-6 py-16 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/favicon.png" alt="" width={32} height={32} className="rounded-full" />
            <span className="font-display text-sm tracking-[0.14em]">
              ALTIVOX<span className="text-cyan">AI</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-mist">{t.footer.slogan}</p>
        </div>
        <div className="flex flex-wrap gap-5 text-xs text-mist-muted">
          <a href="#home" className="hover:text-cyan">
            {t.nav.home}
          </a>
          <a href="#ofertas" className="hover:text-cyan">
            {t.nav.offers}
          </a>
          <a href="#contact" className="hover:text-cyan">
            {t.nav.contact}
          </a>
          <button type="button" className="hover:text-cyan" onClick={() => setLegal(true)}>
            {t.footer.legal}
          </button>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-7xl text-[11px] text-mist-muted">
        © {new Date().getFullYear()} AltivoxAi · www.altivoxai.es
      </p>

      {legal ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-6"
          onClick={() => setLegal(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            className="glass max-h-[80vh] w-full max-w-2xl overflow-auto rounded-3xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl uppercase text-white">{t.footer.legal}</h3>
            <p className="mt-4 text-sm leading-relaxed text-mist">
              Los contenidos, demos y materiales de AltivoxAi tienen carácter informativo y
              comercial. El uso de formularios, chat y calculadoras implica el tratamiento de
              datos para gestionar solicitudes conforme a la normativa aplicable. Contacto:
              info@altivoxai.es · www.altivoxai.es
            </p>
            <button type="button" className="btn-primary mt-6" onClick={() => setLegal(false)}>
              OK
            </button>
          </div>
        </div>
      ) : null}
    </footer>
  );
}
