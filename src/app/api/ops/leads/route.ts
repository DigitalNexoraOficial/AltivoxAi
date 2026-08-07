/**
 * GET /api/ops/leads — list leads (presupuesto / contacto) for encargo hints.
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
  const gate = await requireOpsUser(req, "leads.list");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;

  try {
    if (!can(user.subject, "lead.read").allowed) {
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
      `${SUPABASE_URL}/rest/v1/leads?select=id,nombre,email,empresa,telefono,mensaje,tipo_interes,fuente,estado,created_at&order=created_at.desc&limit=200`,
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
    const leads = rows.map((r) => ({
      id: String(r.id),
      nombre: String(r.nombre || ""),
      email: String(r.email || ""),
      empresa: String(r.empresa || ""),
      telefono: String(r.telefono || ""),
      mensaje: String(r.mensaje || ""),
      tipoInteres: String(r.tipo_interes || ""),
      fuente: String(r.fuente || ""),
      estado: String(r.estado || ""),
      createdAt: String(r.created_at || ""),
    }));

    await auditOk(user, ip, "leads.list", "lead.read");
    return NextResponse.json({ leads });
  } catch (err) {
    return handleEngineError(err, {
      user,
      ip,
      action: "leads.list",
      permission: "lead.read",
    });
  }
}
