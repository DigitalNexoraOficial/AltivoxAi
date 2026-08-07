/**
 * POST /api/ops/agent-runs — create run
 */
import { NextRequest, NextResponse } from "next/server";
import { createAgentRun } from "@/core/agent-runtime";
import {
  requireOpsUser,
  handleAgentError,
  auditOk,
  readJson,
} from "../_agent-shared";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const gate = await requireOpsUser(req, "agent.run.create");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;
  try {
    const body = await readJson(req);
    const agentId = String(body.agentId || "");
    // Delivery agents only run via Encargos approve gate (use-cases), never HTTP create.
    if (agentId.startsWith("delivery.")) {
      return NextResponse.json(
        {
          error: "forbidden",
          message: "delivery_agents_encargo_only",
        },
        { status: 403 }
      );
    }
    const run = await createAgentRun(user.subject, {
      agentId,
      projectId:
        body.projectId === undefined || body.projectId === null
          ? null
          : String(body.projectId),
      input:
        body.input && typeof body.input === "object" && !Array.isArray(body.input)
          ? (body.input as Record<string, unknown>)
          : {},
    });
    await auditOk(user, ip, "agent.run.create", "agent.execute", run.id);
    return NextResponse.json({ run }, { status: 201 });
  } catch (err) {
    return handleAgentError(err, {
      user,
      ip,
      action: "agent.run.create",
      permission: "agent.execute",
    });
  }
}
