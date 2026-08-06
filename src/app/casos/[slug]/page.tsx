import Link from "next/link";
import { notFound } from "next/navigation";
import { cmsCases, getCase } from "@/content/cms";

export function generateStaticParams() {
  return cmsCases.map((c) => ({ slug: c.slug }));
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getCase(slug);
  if (!item) notFound();

  return (
    <main className="relative z-10 mx-auto min-h-[100svh] max-w-5xl px-6 py-24">
      <p className="step-num">Caso full-screen · {item.industry}</p>
      <h1 className="heading-display mt-4 text-4xl md:text-6xl">{item.title}</h1>
      <p className="mt-5 max-w-2xl text-lg text-mist-muted">{item.summary}</p>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <article className="ref-card">
          <p className="step-num">Antes</p>
          <p className="mt-3 text-soft">{item.before}</p>
        </article>
        <article className="ref-card-strong">
          <p className="step-num">Después</p>
          <p className="mt-3 text-white">{item.after}</p>
        </article>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {item.metrics.map((m) => (
          <div key={m.label} className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-3xl font-semibold text-cyan">{m.value}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-mist-muted">{m.label}</p>
          </div>
        ))}
      </div>

      <blockquote className="mt-10 border-l border-cyan/40 pl-4 text-lg text-soft">“{item.quote}”</blockquote>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/#contact" className="btn-primary ui-lift">Pedir un caso así →</Link>
        <Link href="/#casestudies" className="btn-ghost ui-lift">Volver a casos</Link>
      </div>
    </main>
  );
}
