"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function WelcomeInner() {
  const params = useSearchParams();
  const nombre = params.get("nombre") || "";
  const email = params.get("email") || "";

  return (
    <main className="relative z-10 mx-auto flex min-h-[100svh] max-w-3xl flex-col justify-center px-6 py-24">
      <p className="step-num">Onboarding premium</p>
      <h1 className="heading-display mt-4 text-4xl md:text-6xl">
        Bienvenido{nombre ? `, ${nombre}` : ""}
        <span className="text-gradient">.</span>
      </h1>
      <p className="mt-5 text-base text-mist-muted md:text-lg">
        Tu solicitud ya está en el pipeline de Altivox AI. En breve te contactamos para la llamada de 15 minutos.
      </p>
      {email ? <p className="mt-3 text-sm text-cyan">{email}</p> : null}

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          ["01", "Diagnóstico", "Revisamos tu captación actual"],
          ["02", "Piloto", "Propuesta cerrada en días"],
          ["03", "Go-live", "Chatbot y automatización operativos"],
        ].map(([n, t, d]) => (
          <div key={n} className="ref-card">
            <p className="step-num">{n}</p>
            <p className="mt-2 font-semibold text-white">{t}</p>
            <p className="mt-2 text-xs text-mist-muted">{d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/#ofertas" className="btn-primary ui-lift">
          Ver paquetes →
        </Link>
        <Link href="/#home" className="btn-ghost ui-lift">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}

export default function BienvenidaPage() {
  return (
    <Suspense fallback={<main className="p-10 text-white">Cargando...</main>}>
      <WelcomeInner />
    </Suspense>
  );
}
