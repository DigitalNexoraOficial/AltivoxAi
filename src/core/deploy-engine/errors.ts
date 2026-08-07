/**
 * Deploy Engine errors (Bloque 7 · ADR-017).
 */

export type DeployErrorCode =
  | "forbidden"
  | "invalid_input"
  | "not_found"
  | "invalid_transition"
  | "conflict"
  | "persistence_error"
  | "packaging_error";

export class DeployError extends Error {
  readonly code: DeployErrorCode;
  readonly status: number;
  constructor(code: DeployErrorCode, message: string, status?: number) {
    super(message);
    this.name = "DeployError";
    this.code = code;
    this.status =
      status ??
      (code === "forbidden"
        ? 403
        : code === "not_found"
          ? 404
          : code === "conflict"
            ? 409
            : code === "invalid_transition" ||
                code === "invalid_input" ||
                code === "packaging_error"
              ? 400
              : 500);
  }
}
