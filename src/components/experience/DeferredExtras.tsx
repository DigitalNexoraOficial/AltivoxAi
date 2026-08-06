"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const BrandLoader = dynamic(() => import("@/components/experience/BrandLoader").then((m) => m.BrandLoader), { ssr: false });
const CustomCursor = dynamic(() => import("@/components/effects/CustomCursor").then((m) => m.CustomCursor), { ssr: false });
const SoundToggle = dynamic(() => import("@/components/effects/SoundToggle").then((m) => m.SoundToggle), { ssr: false });
const ScrollStorytelling = dynamic(() => import("@/components/effects/ScrollStorytelling").then((m) => m.ScrollStorytelling), { ssr: false });
const StudioTour = dynamic(() => import("@/components/experience/StudioTour").then((m) => m.StudioTour), { ssr: false });
const WhatsAppCTA = dynamic(() => import("@/components/experience/WhatsAppCTA").then((m) => m.WhatsAppCTA), { ssr: false });
const MicroInteractions = dynamic(() => import("@/components/effects/MicroInteractions").then((m) => m.MicroInteractions), { ssr: false });

/** Mounts non-critical UX only after idle to protect LCP/INP. */
export function DeferredExtras() {
  const [introReady, setIntroReady] = useState(false);
  const [extrasReady, setExtrasReady] = useState(false);

  useEffect(() => {
    // Brand intro can appear quickly; heavier extras wait for idle.
    const intro = window.setTimeout(() => setIntroReady(true), 80);
    const start = () => setExtrasReady(true);
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(start, { timeout: 2200 });
    } else {
      timeoutId = window.setTimeout(start, 900);
    }
    return () => {
      window.clearTimeout(intro);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      {introReady ? <BrandLoader /> : null}
      {extrasReady ? (
        <>
          <CustomCursor />
          <ScrollStorytelling />
          <StudioTour />
          <SoundToggle />
          <WhatsAppCTA />
          <MicroInteractions />
        </>
      ) : null}
    </>
  );
}
