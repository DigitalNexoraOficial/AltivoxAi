/**
 * Mustang preset for the canonical cinematic 3D scroll landing.
 * Reference implementation: same architecture as any other object swap.
 *
 * @see ./cinematic-3d-landing.ts
 * @see ../../.cursor/skills/cinematic-3d-scroll-landing/SKILL.md
 */

import {
  buildCinematic3dScrollLandingHtml,
  type CinematicBeat,
} from "./cinematic-3d-landing";

const MODEL = {
  title: "Ford Mustang",
  author: "Nathan Kenopic",
  authorUrl: "https://github.com/NateKenopic",
  sourceUrl: "https://github.com/NateKenopic/3d-car",
} as const;

/** Scroll-synced marketing beats (titles + sales copy). */
function mustangMarketingBeats(carTitle: string): CinematicBeat[] {
  return [
    {
      step: "01",
      label: "Leyenda",
      title: carTitle,
      desc: "La silueta que para el scroll. Presencia de muscle car para enamorar al cliente antes del primer mensaje.",
    },
    {
      step: "02",
      label: "Acceso",
      title: "Puertas que invitan a subir",
      desc: "Conductor y copiloto: el momento en el que la experiencia se vuelve personal y el deseo de probarlo se dispara.",
    },
    {
      step: "03",
      label: "Cockpit",
      title: "Interior que cierra el trato",
      desc: "Asientos, salpicadero y detalle premium. Enséñalo en 3D y convierte curiosidad en reserva.",
    },
    {
      step: "04",
      label: "Mirada",
      title: "La luna que vende emoción",
      desc: "Salimos por el parabrisas hacia el morro: el plano heroico para campañas, anuncios y demos que convierten.",
    },
    {
      step: "05",
      label: "Potencia",
      title: "Capó abierto, motor al frente",
      desc: "Espectáculo técnico y comercial: el vano motor como argumento de venta que nadie puede ignorar.",
    },
  ];
}

export function buildMustangPhotoLandingHtml(input: {
  clientName: string;
  carTitle: string;
}): string {
  return buildCinematic3dScrollLandingHtml({
    brand: input.clientName || "Altivox",
    objectTitle: input.carTitle || "Ford Mustang GT 1990",
    loadLabel: "Cargando Mustang 3D",
    assetSlug: "mustang",
    modelFiles: ["mustang.glb", "foxbody.glb"],
    beats: mustangMarketingBeats(input.carTitle || "Ford Mustang GT 1990"),
    credit: {
      author: MODEL.author,
      authorUrl: MODEL.authorUrl,
      sourceUrl: MODEL.sourceUrl,
    },
    pinBranch: "cursor/mustang-marketing-copy-4521",
    openPartMeshPattern: "^Kapoot_7$|^Rooye_Kapoot",
    openPartPivotName: "HoodPivot",
    fpsGlobal: "__mustangFps",
  });
}
