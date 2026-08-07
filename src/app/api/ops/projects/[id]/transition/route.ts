/**
 * POST /api/ops/projects/[id]/transition
 * Body: { status: ProjectStatus }
 */
import { NextRequest, NextResponse } from "next/server";
import {
  transitionProject,
  actionForTransition,
  isProjectStatus,
} from "@/core/project-engine";
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
  const gate = await requireOpsUser(req, "project.transition");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;

  try {
    const body = await readJson(req);
    const status =
      typeof body.status === "string"
        ? body.status
        : typeof body.to === "string"
          ? body.to
          : "";
    if (!isProjectStatus(status)) {
      return NextResponse.json(
        { error: "invalid_input", message: "invalid_target_status" },
        { status: 400 }
      );
    }
    const project = await transitionProject(user.subject, id, status);
    await auditOk(
      user,
      ip,
      "project.transition",
      actionForTransition(status),
      id
    );
    return NextResponse.json({ project });
  } catch (err) {
    return handleEngineError(err, {
      user,
      ip,
      action: "project.transition",
      permission: "project.transition",
      projectId: id,
    });
  }
}
