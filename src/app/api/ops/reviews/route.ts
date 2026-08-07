/**
 * GET  /api/ops/reviews?projectId= — list
 * POST /api/ops/reviews — create review session (+ token once)
 */
import { NextRequest, NextResponse } from "next/server";
import {
  createReview,
  listReviewsForProject,
  type ReviewDeliverableSnapshot,
} from "@/core/review-engine";
import {
  requireOpsUser,
  handleReviewError,
  auditOk,
  readJson,
} from "./_shared";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const gate = await requireOpsUser(req, "review.list");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;
  try {
    const projectId = req.nextUrl.searchParams.get("projectId") || "";
    const reviews = await listReviewsForProject(user.subject, projectId);
    await auditOk(user, ip, "review.list", "project.read");
    return NextResponse.json({ reviews });
  } catch (err) {
    return handleReviewError(err, {
      user,
      ip,
      action: "review.list",
      permission: "project.read",
    });
  }
}

export async function POST(req: NextRequest) {
  const gate = await requireOpsUser(req, "review.create");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;
  try {
    const body = await readJson(req);
    const deliverablesRaw = Array.isArray(body.deliverables)
      ? body.deliverables
      : [];
    const deliverables: ReviewDeliverableSnapshot[] = deliverablesRaw.map(
      (d) => {
        const row = (d && typeof d === "object" ? d : {}) as Record<
          string,
          unknown
        >;
        return {
          deliverableId: String(row.deliverableId || row.id || ""),
          title: String(row.title || ""),
          kind: String(row.kind || "artifact"),
          uri: row.uri == null ? null : String(row.uri),
          metadata:
            row.metadata &&
            typeof row.metadata === "object" &&
            !Array.isArray(row.metadata)
              ? (row.metadata as Record<string, unknown>)
              : {},
        };
      }
    );

    const view = await createReview(user.subject, {
      projectId: String(body.projectId || ""),
      versionId: String(body.versionId || ""),
      deliverables,
      expiresAt: body.expiresAt ? String(body.expiresAt) : undefined,
      activate: body.activate === false ? false : true,
    });
    await auditOk(
      user,
      ip,
      "review.create",
      "review.create",
      view.review.id
    );
    return NextResponse.json(view, { status: 201 });
  } catch (err) {
    return handleReviewError(err, {
      user,
      ip,
      action: "review.create",
      permission: "review.create",
    });
  }
}
