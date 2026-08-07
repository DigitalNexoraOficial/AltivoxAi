export type EncargoErrorCode =
  | "forbidden"
  | "invalid_input"
  | "not_found"
  | "conflict"
  | "persistence_error"
  | "gate_required";

export class EncargoError extends Error {
  readonly code: EncargoErrorCode;
  readonly status: number;
  constructor(code: EncargoErrorCode, message: string, status?: number) {
    super(message);
    this.name = "EncargoError";
    this.code = code;
    this.status =
      status ??
      (code === "forbidden"
        ? 403
        : code === "not_found"
          ? 404
          : code === "conflict" || code === "gate_required"
            ? 409
            : code === "invalid_input"
              ? 400
              : 500);
  }
}
