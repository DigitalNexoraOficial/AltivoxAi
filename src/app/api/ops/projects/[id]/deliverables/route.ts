/**
 * POST /api/ops/projects/[id]/deliverables
 */
import { NextRequest, NextResponse } from "next/server";
import { registerDeliverable, actionForOp } from "@/core/project-engine";
import {
  requireOpsUser,
  handleEngineError,
  auditOk,
  readJson,
} from "../../_shared";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const gate = await requireOpsUser(req, "project.deliverable_register");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;

  try {
    const body = await readJson(req);
    const deliverable = await registerDeliverable(user.subject, id, {
      title: typeof body.title === "string" ? body.title : undefined,
      kind: typeof body.kind === "string" ? body.kind : undefined,
      uri: typeof body.uri === "string" ? body.uri : body.uri === null ? null : undefined,
      versionId:
        typeof body.versionId === "string"
          ? body.versionId
          : typeof body.version_id === "string"
            ? body.version_id
            : body.versionId === null || body.version_id === null
              ? null
              : undefined,
      metadata:
        body.metadata && typeof body.metadata === "object"
          ? (body.metadata as Record<string, unknown>)
          : undefined,
    });
    await auditOk(
      user,
      ip,
      "project.deliverable_register",
      actionForOp("register_deliverable"),
      id
    );
    return NextResponse.json({ deliverable }, { status: 201 });
  } catch (err) {
    return handleEngineError(err, {
      user,
      ip,
      action: "project.deliverable_register",
      permission: actionForOp("register_deliverable"),
      projectId: id,
    });
  }
}
