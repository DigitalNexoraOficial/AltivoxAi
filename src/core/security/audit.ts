/**
 * Audit log writer for existing operations only (Bloque 1).
 * Best-effort: never throws to callers.
 */

export type AuditEventInput = {
  actorType: "human" | "machine" | "anonymous" | "system";
  actorId?: string;
  actorRole?: string;
  action: string;
  permission?: string;
  resourceType?: string;
  resourceId?: string;
  result: "ok" | "deny" | "error" | "rate_limited" | "rejected";
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  errorCode?: string;
};

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://soeyfivsuwohuuzgfqar.supabase.co";

function redact(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    const key = k.toLowerCase();
    if (
      key.includes("password") ||
      key.includes("secret") ||
      key.includes("token") ||
      key.includes("authorization") ||
      key.includes("apikey") ||
      key.includes("api_key")
    ) {
      out[k] = "[redacted]";
    } else {
      out[k] = v;
    }
  }
  return out;
}

export async function writeAuditEvent(event: AuditEventInput): Promise<void> {
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!key) return;

  const row = {
    actor_type: event.actorType,
    actor_id: event.actorId || null,
    actor_role: event.actorRole || null,
    action: event.action,
    permission: event.permission || null,
    resource_type: event.resourceType || null,
    resource_id: event.resourceId || null,
    result: event.result,
    ip: event.ip || null,
    user_agent: event.userAgent || null,
    metadata: redact(event.metadata) || {},
    error_code: event.errorCode || null,
  };

  try {
    await fetch(SUPABASE_URL + "/rest/v1/audit_events", {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
  } catch {
    // swallow — audit must not break primary flows
  }
}
