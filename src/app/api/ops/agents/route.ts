/**
 * GET  /api/ops/agents — list
 * POST /api/ops/agents — register manifest
 */
import { NextRequest, NextResponse } from "next/server";
import { listAgents, registerAgent } from "@/core/agent-manager";
import {
  requireOpsUser,
  handleAgentError,
  auditOk,
  readJson,
} from "../_agent-shared";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const gate = await requireOpsUser(req, "agent.list");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;
  try {
    const agents = await listAgents(user.subject);
    await auditOk(user, ip, "agent.list", "agent.execute");
    return NextResponse.json({ agents });
  } catch (err) {
    return handleAgentError(err, {
      user,
      ip,
      action: "agent.list",
      permission: "agent.execute",
    });
  }
}

export async function POST(req: NextRequest) {
  const gate = await requireOpsUser(req, "agent.register");
  if (!gate.ok) return gate.response;
  const { user, ip } = gate;
  try {
    const body = await readJson(req);
    const agent = await registerAgent(user.subject, body);
    await auditOk(user, ip, "agent.register", "agent.configure", agent.id);
    return NextResponse.json({ agent }, { status: 201 });
  } catch (err) {
    return handleAgentError(err, {
      user,
      ip,
      action: "agent.register",
      permission: "agent.configure",
    });
  }
}
