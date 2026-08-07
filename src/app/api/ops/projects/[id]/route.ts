/**
 * GET   /api/ops/projects/[id]
 * PATCH /api/ops/projects/[id]
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getProject,
  updateProjectMeta,
  actionForOp,
} from "@/core/project-engine";
import {
  requireOpsUser,
  handleEngineError,
  auditOk,
  readJson,
} from "../_shared";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const gate = await requireOpsUser(req, "project.get");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;

  try {
    const project = await getProject(user.subject, id);
    await auditOk(user, ip, "project.get", actionForOp("read"), id);
    return NextResponse.json({ project });
  } catch (err) {
    return handleEngineError(err, {
      user,
      ip,
      action: "project.get",
      permission: actionForOp("read"),
      projectId: id,
    });
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const gate = await requireOpsUser(req, "project.update");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;

  try {
    const body = await readJson(req);
    const project = await updateProjectMeta(user.subject, id, {
      name: typeof body.name === "string" ? body.name : undefined,
      serviceType:
        typeof body.serviceType === "string"
          ? body.serviceType
          : typeof body.service_type === "string"
            ? body.service_type
            : undefined,
      clientId:
        typeof body.clientId === "string"
          ? body.clientId
          : typeof body.client_id === "string"
            ? body.client_id
            : body.clientId === null || body.client_id === null
              ? null
              : undefined,
      leadId:
        typeof body.leadId === "string"
          ? body.leadId
          : typeof body.lead_id === "string"
            ? body.lead_id
            : body.leadId === null || body.lead_id === null
              ? null
              : undefined,
      description:
        typeof body.description === "string" ? body.description : undefined,
      metadata:
        body.metadata && typeof body.metadata === "object"
          ? (body.metadata as Record<string, unknown>)
          : undefined,
    });
    await auditOk(user, ip, "project.update", actionForOp("update_meta"), id);
    return NextResponse.json({ project });
  } catch (err) {
    return handleEngineError(err, {
      user,
      ip,
      action: "project.update",
      permission: actionForOp("update_meta"),
      projectId: id,
    });
  }
}
