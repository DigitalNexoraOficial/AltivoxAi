/**
 * Client bridge: AltivoxAI → /api/n8n → n8n Webhook
 * Usage: import { emit, leadCreated } from "@/lib/n8n-bridge"
 */

const ENDPOINT = "/api/n8n";

export type N8nEmitResult =
  | { ok: boolean; status: number; json: any }
  | { ok: false; error: string };

export type N8nEmitOpts = {
  test?: boolean;
};

export async function emit(
  event: string,
  data?: unknown,
  opts?: N8nEmitOpts
): Promise<N8nEmitResult> {
  const payload = {
    action: "emit",
    event,
    data: data || {},
    test: Boolean(opts?.test),
  };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    const json = await res.json();
    return { ok: res.ok, status: res.status, json };
  } catch (err: any) {
    console.warn("[AltivoxN8n] emit failed", event, err);
    return { ok: false, error: String(err?.message ? err.message : err) };
  }
}

export function ping(from?: string): Promise<N8nEmitResult> {
  return emit("system.ping", { message: "pong", from: from || "browser" });
}

export async function status(): Promise<any> {
  try {
    const r = await fetch(ENDPOINT, { method: "GET" });
    return await r.json();
  } catch (err: any) {
    return { ok: false, error: String(err?.message ? err.message : err) };
  }
}

/** Fire-and-forget helpers used by admin pages */
export function leadCreated(lead: any): Promise<N8nEmitResult> {
  const ev =
    lead &&
    (String(lead.clasificacion || "").toLowerCase() === "caliente" ||
      Number(lead.score || 0) >= 70)
      ? "lead.hot"
      : "lead.created";
  return emit(ev, lead);
}

export function leadUpdated(lead: any, patch?: any): Promise<N8nEmitResult> {
  let event = "lead.updated";
  if (patch && String(patch.estado || "").toLowerCase() === "contactado") {
    event = "lead.contacted";
  }
  return emit(event, { lead, patch: patch || {} });
}

export function clienteEvent(name: string, cliente: any): Promise<N8nEmitResult> {
  return emit(name, cliente);
}

const AltivoxN8n = {
  emit,
  ping,
  status,
  leadCreated,
  leadUpdated,
  clienteEvent,
};

export default AltivoxN8n;
