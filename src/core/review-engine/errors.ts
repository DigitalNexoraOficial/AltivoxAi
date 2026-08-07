/**
 * Review Engine errors (Bloque 6 · ADR-016).
 */

export type ReviewErrorCode =
  | "forbidden"
  | "invalid_input"
  | "not_found"
  | "invalid_transition"
  | "invalid_token"
  | "token_expired"
  | "token_revoked"
  | "conflict"
  | "persistence_error";

export class ReviewError extends Error {
  readonly code: ReviewErrorCode;
  readonly status: number;
  constructor(code: ReviewErrorCode, message: string, status?: number) {
    super(message);
    this.name = "ReviewError";
    this.code = code;
    this.status =
      status ??
      (code === "forbidden"
        ? 403
        : code === "not_found" || code === "invalid_token"
          ? 404
          : code === "token_expired" || code === "token_revoked"
            ? 410
            : code === "conflict"
              ? 409
              : code === "invalid_transition" || code === "invalid_input"
                ? 400
                : 500);
  }
}
