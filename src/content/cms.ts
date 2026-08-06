export type CmsCase = {
  slug: string;
  title: string;
  industry: string;
  summary: string;
  before: string;
  after: string;
  metrics: { label: string; value: string }[];
  quote: string;
};

export type CmsPost = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
};

export const cmsCases: CmsCase[] = [
  {
    slug: "piloto-retail",
    title: "Piloto retail: de formularios fríos a leads calientes",
    industry: "Retail",
    summary: "Chatbot + routing en 7 días con precio cerrado.",
    before: "Respuestas lentas y leads perdidos fuera de horario.",
    after: "Cualificación automática y alerta comercial en calientes.",
    metrics: [
      { label: "Leads contactados", value: "+38%" },
      { label: "Go-live", value: "7 días" },
      { label: "Respuesta media", value: "< 2 min" },
    ],
    quote: "Por fin el equipo solo habla con oportunidades reales.",
  },
  {
    slug: "clinica-citas",
    title: "Clínica: citas cualificadas sin saturar recepción",
    industry: "Servicios",
    summary: "Agente conversacional para agenda y FAQs.",
    before: "Teléfono saturado y citas mal filtradas.",
    after: "Pre-cualificación + handoff humano solo cuando hace falta.",
    metrics: [
      { label: "Citas válidas", value: "+27%" },
      { label: "Carga recepción", value: "-35%" },
      { label: "Satisfacción", value: "4.8/5" },
    ],
    quote: "El chatbot no sustituye al equipo: lo protege.",
  },
];

export const cmsPosts: CmsPost[] = [
  {
    slug: "checklist-chatbot-7-dias",
    title: "Checklist: chatbot en 7 días sin caos",
    excerpt: "Qué preparar antes del piloto para no perder tiempo.",
    body: "Define oferta, FAQs, horarios de escalado y CRM destino. Con eso, Altivox despliega el piloto en una semana.",
  },
  {
    slug: "roi-automatizacion-leads",
    title: "Cómo calcular ROI de automatización de leads",
    excerpt: "Horas, coste y conversión: el modelo simple.",
    body: "Multiplica horas manuales por coste hora y cruza con leads recuperados. Si el piloto se paga solo, escala.",
  },
];

export function getCase(slug: string) {
  return cmsCases.find((c) => c.slug === slug);
}
