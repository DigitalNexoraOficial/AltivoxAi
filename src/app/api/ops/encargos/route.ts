/**
 * GET  /api/ops/encargos
 * POST /api/ops/encargos
 */
import { NextRequest, NextResponse } from "next/server";
import {
  createEncargoDraft,
  listEncargos,
  ENCARGO_SERVICES,
} from "@/core/encargo";
import {
  requireOpsUser,
  handleEncargoError,
  auditOk,
  readJson,
} from "./_shared";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const gate = await requireOpsUser(req, "encargo.list");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;
  try {
    const encargos = await listEncargos(user.subject);
    await auditOk(user, ip, "encargo.list", "project.read");
    return NextResponse.json({ encargos, services: ENCARGO_SERVICES });
  } catch (err) {
    return handleEncargoError(err, {
      user,
      ip,
      action: "encargo.list",
      permission: "project.read",
    });
  }
}

export async function POST(req: NextRequest) {
  const gate = await requireOpsUser(req, "encargo.create");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;
  try {
    const body = await readJson(req);
    const view = await createEncargoDraft(user.subject, {
      clientId: String(body.clientId || ""),
      clientName: String(body.clientName || ""),
      leadId: body.leadId == null ? null : String(body.leadId),
      serviceKey: String(body.serviceKey || ""),
      description: String(body.description || ""),
    });
    await auditOk(user, ip, "encargo.create", "project.create", view.encargo.id);
    return NextResponse.json(view, { status: 201 });
  } catch (err) {
    return handleEncargoError(err, {
      user,
      ip,
      action: "encargo.create",
      permission: "project.create",
    });
  }
}
