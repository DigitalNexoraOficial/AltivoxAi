/**
 * GET  /api/ops/deployments?projectId=
 * POST /api/ops/deployments
 */
import { NextRequest, NextResponse } from "next/server";
import {
  createDeployment,
  listDeployments,
  type DeployDeliverableRef,
} from "@/core/deploy-engine";
import {
  requireOpsUser,
  handleDeployError,
  auditOk,
  readJson,
} from "./_shared";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const gate = await requireOpsUser(req, "deployment.list");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;
  try {
    const projectId = req.nextUrl.searchParams.get("projectId") || undefined;
    const deployments = await listDeployments(
      user.subject,
      projectId ? { projectId } : undefined
    );
    await auditOk(user, ip, "deployment.list", "project.read");
    return NextResponse.json({ deployments });
  } catch (err) {
    return handleDeployError(err, {
      user,
      ip,
      action: "deployment.list",
      permission: "project.read",
    });
  }
}

export async function POST(req: NextRequest) {
  const gate = await requireOpsUser(req, "deployment.create");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;
  try {
    const body = await readJson(req);
    const deliverablesRaw = Array.isArray(body.deliverables)
      ? body.deliverables
      : [];
    const deliverables: DeployDeliverableRef[] = deliverablesRaw.map((d) => {
      const row = (d && typeof d === "object" ? d : {}) as Record<
        string,
        unknown
      >;
      return {
        deliverableId: String(row.deliverableId || row.id || ""),
        title: String(row.title || ""),
        kind: String(row.kind || "artifact"),
        uri: row.uri == null ? null : String(row.uri),
        content: row.content == null ? null : String(row.content),
      };
    });

    const view = await createDeployment(user.subject, {
      projectId: String(body.projectId || ""),
      versionId: String(body.versionId || ""),
      deliverables,
      config:
        body.config && typeof body.config === "object" && !Array.isArray(body.config)
          ? (body.config as Record<string, unknown>)
          : undefined,
    });
    await auditOk(
      user,
      ip,
      "deployment.create",
      "deploy.create",
      view.deployment.id
    );
    return NextResponse.json(view, { status: 201 });
  } catch (err) {
    return handleDeployError(err, {
      user,
      ip,
      action: "deployment.create",
      permission: "deploy.create",
    });
  }
}
