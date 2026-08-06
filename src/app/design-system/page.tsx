import Link from "next/link";
import { tokens, motionRules } from "@/lib/brand-system";
import { cmsCases, cmsPosts } from "@/content/cms";

export default function DesignSystemPage() {
  return (
    <main className="relative z-10 mx-auto min-h-[100svh] max-w-5xl px-6 py-24">
      <p className="step-num">Design system · Storybook-light</p>
      <h1 className="heading-display mt-4 text-4xl md:text-6xl">Tokens Altivox</h1>
      <p className="mt-4 max-w-2xl text-mist-muted">
        Documentación viva de color, motion y contenido CMS. Sin sobrecargar el bundle principal.
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Color</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(tokens.color).map(([name, value]) => (
            <div key={name} className="rounded-2xl border border-white/10 p-3">
              <div className="h-12 rounded-xl" style={{ background: value }} />
              <p className="mt-2 text-xs text-mist-muted">{name}</p>
              <p className="font-mono text-[11px] text-soft">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Motion rules</h2>
        <ul className="mt-4 space-y-2 text-sm text-mist-muted">
          {Object.entries(motionRules).map(([k, v]) => (
            <li key={k} className="rounded-xl border border-white/10 px-3 py-2">
              <span className="text-cyan">{k}</span>: {v}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">CMS cases</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {cmsCases.map((c) => (
            <Link key={c.slug} href={`/casos/${c.slug}`} className="ref-card hover:border-cyan/40">
              <p className="text-xs text-cyan">{c.industry}</p>
              <p className="mt-2 font-semibold text-white">{c.title}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">CMS posts</h2>
        <div className="mt-4 space-y-3">
          {cmsPosts.map((p) => (
            <article key={p.slug} className="rounded-2xl border border-white/10 p-4">
              <p className="font-semibold text-white">{p.title}</p>
              <p className="mt-1 text-sm text-mist-muted">{p.excerpt}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <span className="btn-primary">Primary</span>
        <span className="btn-ghost">Ghost</span>
        <span className="eyebrow">Eyebrow</span>
      </div>

      <Link href="/" className="btn-ghost ui-lift mt-10 inline-flex">Volver</Link>
    </main>
  );
}
