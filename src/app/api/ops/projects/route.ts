/**
 * GET  /api/ops/projects — list
 * POST /api/ops/projects — create
 */
import { NextRequest, NextResponse } from "next/server";
import {
  createProject,
  listProjects,
  isProjectStatus,
  actionForOp,
} from "@/core/project-engine";
import {
  requireOpsUser,
  handleEngineError,
  auditOk,
  readJson,
} from "./_shared";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const gate = await requireOpsUser(req, "project.list");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;

  try {
    const url = new URL(req.url);
    const statusRaw = url.searchParams.get("status");
    const clientId = url.searchParams.get("clientId") || undefined;
    const limit = Number(url.searchParams.get("limit") || "50");
    const offset = Number(url.searchParams.get("offset") || "0");

    if (statusRaw && !isProjectStatus(statusRaw)) {
      return NextResponse.json(
        { error: "invalid_input", message: "invalid_status_filter" },
        { status: 400 }
      );
    }

    const projects = await listProjects(user.subject, {
      status: statusRaw && isProjectStatus(statusRaw) ? statusRaw : undefined,
      clientId,
      limit: Number.isFinite(limit) ? limit : 50,
      offset: Number.isFinite(offset) ? offset : 0,
    });
    await auditOk(user, ip, "project.list", actionForOp("read"));
    return NextResponse.json({ projects });
  } catch (err) {
    return handleEngineError(err, {
      user,
      ip,
      action: "project.list",
      permission: actionForOp("read"),
    });
  }
}

export async function POST(req: NextRequest) {
  const gate = await requireOpsUser(req, "project.create");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;

  try {
    const body = await readJson(req);
    const project = await createProject(user.subject, {
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
    await auditOk(
      user,
      ip,
      "project.create",
      actionForOp("create"),
      project.id
    );
    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    return handleEngineError(err, {
      user,
      ip,
      action: "project.create",
      permission: actionForOp("create"),
    });
  }
}
