"use client";

import { useIndustry } from "@/components/providers/IndustryProvider";

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "34600000000";
const CAL_URL = process.env.NEXT_PUBLIC_CAL_URL || "";

export function WhatsAppCTA() {
  const { industry } = useIndustry();
  const text = encodeURIComponent(
    `Hola Altivox AI 👋 Soy una ${industry.label}. Quiero info sobre chatbot/automatización. ${industry.hook}`
  );
  const href = `https://wa.me/${WA_NUMBER}?text=${text}`;

  return (
    <div className="fixed bottom-24 left-6 z-[94] flex flex-col gap-2">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-cyan/30 bg-cyan/15 px-3 py-2 text-[10px] uppercase tracking-widest text-cyan backdrop-blur hover:bg-cyan/25"
        aria-label="WhatsApp Business"
      >
        WhatsApp
      </a>
      {CAL_URL ? (
        <a
          href={CAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/15 bg-black/50 px-3 py-2 text-[10px] uppercase tracking-widest text-mist-muted backdrop-blur hover:text-white"
        >
          Calendario
        </a>
      ) : null}
    </div>
  );
}
