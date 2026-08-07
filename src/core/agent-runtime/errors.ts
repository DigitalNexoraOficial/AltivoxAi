/**
 * Agent Runtime / Manager shared errors (Bloque 5 · ADR-015).
 */

export type AgentErrorCode =
  | "forbidden"
  | "invalid_input"
  | "not_found"
  | "invalid_transition"
  | "conflict"
  | "persistence_error"
  | "tool_denied"
  | "execution_error";

export class AgentError extends Error {
  readonly code: AgentErrorCode;
  readonly status: number;
  constructor(code: AgentErrorCode, message: string, status?: number) {
    super(message);
    this.name = "AgentError";
    this.code = code;
    this.status =
      status ??
      (code === "forbidden"
        ? 403
        : code === "not_found"
          ? 404
          : code === "conflict"
            ? 409
            : code === "invalid_transition" || code === "invalid_input" || code === "tool_denied"
              ? 400
              : 500);
  }
}
