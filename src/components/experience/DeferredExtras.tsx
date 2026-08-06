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
const ScrollTop = dynamic(() => import("@/components/ui/ScrollTop").then((m) => m.ScrollTop), { ssr: false });

/** Mounts non-critical UX only after idle to protect LCP/INP. */
export function DeferredExtras() {
  const [introReady, setIntroReady] = useState(false);
  const [extrasReady, setExtrasReady] = useState(false);
  const [stickyUp, setStickyUp] = useState(false);

  useEffect(() => {
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

  useEffect(() => {
    const sync = () => setStickyUp(document.documentElement.dataset.stickyCta === "1");
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-sticky-cta"] });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {introReady ? <BrandLoader /> : null}
      {extrasReady ? (
        <>
          <CustomCursor />
          <ScrollStorytelling />
          <StudioTour />
          <MicroInteractions />
          {/* Left FAB stack: Sound always bottom, ScrollTop above, WhatsApp above when room */}
          <div className="fixed bottom-5 left-3 z-[95] flex flex-col-reverse items-start gap-2 mobile-snap-safe sm:bottom-6 sm:left-5">
            <SoundToggle />
            <ScrollTop />
            {!stickyUp ? <WhatsAppCTA /> : null}
          </div>
        </>
      ) : null}
    </>
  );
}
