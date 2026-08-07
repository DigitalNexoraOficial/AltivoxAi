/**
 * JARVIS Core — public surface (Bloque 4 · ADR-014).
 *
 * Orchestrator / caller only. Ops Route Handlers and future runtimes
 * may import this module; do not expose as public chatbot API in B4.
 */

export type { JarvisIntention } from "./types";
export { JarvisError } from "./types";
export { executeIntention, jarvisMachineSubject } from "./caller";
