/**
 * POST /api/ops/projects/[id]/versions
 */
import { NextRequest, NextResponse } from "next/server";
import { createVersion, actionForOp } from "@/core/project-engine";
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
  const gate = await requireOpsUser(req, "project.version_create");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;

  try {
    const body = await readJson(req);
    const version = await createVersion(user.subject, id, {
      label: typeof body.label === "string" ? body.label : undefined,
      notes: typeof body.notes === "string" ? body.notes : undefined,
      metadata:
        body.metadata && typeof body.metadata === "object"
          ? (body.metadata as Record<string, unknown>)
          : undefined,
    });
    await auditOk(
      user,
      ip,
      "project.version_create",
      actionForOp("create_version"),
      id
    );
    return NextResponse.json({ version }, { status: 201 });
  } catch (err) {
    return handleEngineError(err, {
      user,
      ip,
      action: "project.version_create",
      permission: actionForOp("create_version"),
      projectId: id,
    });
  }
}
