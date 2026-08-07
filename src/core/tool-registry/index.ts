/**
 * Tool Registry — public surface (Bloque 5 · ADR-015 mínimo).
 */

export type { ToolRegistry } from "./frontier";
export {
  completeLlm,
  assertToolAllowed,
  setLlmCompleterForTests,
  type LlmCompleteInput,
  type LlmCompleteResult,
} from "./complete";
