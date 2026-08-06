"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Showreel = dynamic(() => import("@/components/sections/Showreel").then((m) => m.Showreel), { ssr: false, loading: () => null });
const AiAudit = dynamic(() => import("@/components/tools/AiAudit").then((m) => m.AiAudit), { ssr: false, loading: () => null });
const NeedsQuiz = dynamic(() => import("@/components/tools/NeedsQuiz").then((m) => m.NeedsQuiz), { ssr: false, loading: () => null });
const PackageComparator = dynamic(() => import("@/components/tools/PackageComparator").then((m) => m.PackageComparator), { ssr: false, loading: () => null });
const CrmDemo = dynamic(() => import("@/components/tools/CrmDemo").then((m) => m.CrmDemo), { ssr: false, loading: () => null });
const Guarantee = dynamic(() => import("@/components/sections/Guarantee").then((m) => m.Guarantee), { ssr: false, loading: () => null });

/** Growth/tools block: mounts only when near viewport to protect initial load. */
export function GrowthSuite() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: "280px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} id="growth-suite" aria-label="Herramientas Altivox">
      {active ? (
        <>
          <Showreel />
          <AiAudit />
          <NeedsQuiz />
          <PackageComparator />
          <CrmDemo />
          <Guarantee />
        </>
      ) : (
        <div className="section-shell py-16" aria-hidden />
      )}
    </div>
  );
}
