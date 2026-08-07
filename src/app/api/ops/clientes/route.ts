/**
 * GET /api/ops/clientes — list CRM clients (service role).
 */
import { NextRequest, NextResponse } from "next/server";
import { can } from "@/core/security";
import {
  requireOpsUser,
  handleEngineError,
  auditOk,
} from "../projects/_shared";

export const runtime = "nodejs";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://soeyfivsuwohuuzgfqar.supabase.co";

export async function GET(req: NextRequest) {
  const gate = await requireOpsUser(req, "clientes.list");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;

  try {
    if (!can(user.subject, "client.read").allowed && !can(user.subject, "project.read").allowed) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
    if (!key) {
      return NextResponse.json(
        { error: "persistence_error", message: "missing_service_role" },
        { status: 500 }
      );
    }

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/clientes?select=id,nombre,empresa,email,telefono,estado,origen,lead_id,notas,created_at,updated_at&order=nombre.asc`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        cache: "no-store",
      }
    );
    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        {
          error: "persistence_error",
          message: `supabase_${res.status}:${text.slice(0, 120)}`,
        },
        { status: 500 }
      );
    }
    const rows = text ? (JSON.parse(text) as Record<string, unknown>[]) : [];
    const clients = rows.map((r) => ({
      id: String(r.id),
      nombre: String(r.nombre || ""),
      empresa: String(r.empresa || ""),
      email: String(r.email || ""),
      telefono: String(r.telefono || ""),
      estado: String(r.estado || ""),
      origen: String(r.origen || ""),
      leadId: r.lead_id ? String(r.lead_id) : null,
      notas: String(r.notas || ""),
      createdAt: String(r.created_at || ""),
      updatedAt: String(r.updated_at || ""),
    }));

    await auditOk(user, ip, "clientes.list", "client.read");
    return NextResponse.json({ clients });
  } catch (err) {
    return handleEngineError(err, {
      user,
      ip,
      action: "clientes.list",
      permission: "client.read",
    });
  }
}
