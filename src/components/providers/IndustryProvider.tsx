"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type IndustryId = "pyme" | "ecom" | "servicios" | "saas";

type Industry = {
  id: IndustryId;
  label: string;
  hook: string;
  proof: string;
  focus: string[];
};

const INDUSTRIES: Industry[] = [
  {
    id: "pyme",
    label: "Pyme",
    hook: "Más leads cualificados sin ampliar el equipo.",
    proof: "+38% leads contactados en 14 días",
    focus: ["Chatbot web", "Routing de leads", "Seguimiento 24/7"],
  },
  {
    id: "ecom",
    label: "E-commerce",
    hook: "Convierte visitas en pedidos con agentes que venden.",
    proof: "+22% conversión asistida por chat",
    focus: ["Agente de ventas", "FAQs producto", "Recuperación carrito"],
  },
  {
    id: "servicios",
    label: "Servicios",
    hook: "Agenda más llamadas y pierde menos oportunidades.",
    proof: "Primera respuesta en < 2 min",
    focus: ["Captura de citas", "Cualificación", "Alertas comerciales"],
  },
  {
    id: "saas",
    label: "SaaS",
    hook: "Demo requests calientes, no ruido de formularios.",
    proof: "Score automático de intent",
    focus: ["Lead scoring", "Demo routing", "Onboarding asistido"],
  },
];

type Ctx = {
  industry: Industry;
  industries: Industry[];
  setIndustry: (id: IndustryId) => void;
};

const IndustryContext = createContext<Ctx | null>(null);

export function IndustryProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<IndustryId>("pyme");
  const value = useMemo(() => {
    const industry = INDUSTRIES.find((i) => i.id === id) || INDUSTRIES[0];
    return {
      industry,
      industries: INDUSTRIES,
      setIndustry: setId,
    };
  }, [id]);

  return <IndustryContext.Provider value={value}>{children}</IndustryContext.Provider>;
}

export function useIndustry() {
  const ctx = useContext(IndustryContext);
  if (!ctx) throw new Error("useIndustry must be used within IndustryProvider");
  return ctx;
}
