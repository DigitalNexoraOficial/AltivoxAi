/**
 * JARVIS Core caller — orchestrator only (Bloque 4–6 · ADR-014/015/016).
 *
 * Chain: JARVIS → Subject → can() (inside use-cases) → PE / Agent Runtime / Review.
 * Does not call LLM / Tool Registry directly. Not a client portal.
 */

import {
  createProject,
  createVersion,
  getProject,
  listProjects,
  listTimeline,
  registerDeliverable,
  transitionProject,
  updateProjectMeta,
} from "@/core/project-engine";
import {
  cancelAgentRun,
  createAgentRun,
  executeAgentRun,
  getAgentRun,
} from "@/core/agent-runtime";
import {
  bootstrapWebAgents,
  listAgents,
  registerAgent,
  resolveAgentsByCapability,
} from "@/core/agent-manager";
import { createReview, revokeReview } from "@/core/review-engine";
import type { Subject } from "@/core/security";
import { JarvisError, type JarvisIntention } from "./types";

function assertSubject(subject: Subject | null | undefined): Subject {
  if (!subject || (subject.type !== "human" && subject.type !== "machine")) {
    throw new JarvisError("invalid_subject", "missing_or_invalid_subject");
  }
  return subject;
}

/**
 * Execute one internal intention by delegating to public use-cases.
 */
export async function executeIntention(
  subject: Subject | null | undefined,
  intention: JarvisIntention
): Promise<unknown> {
  const s = assertSubject(subject);

  switch (intention.op) {
    case "project.create":
      return createProject(s, intention.input);
    case "project.list":
      return listProjects(s, intention.filter ?? {});
    case "project.get":
      return getProject(s, intention.projectId);
    case "project.update_meta":
      return updateProjectMeta(s, intention.projectId, intention.input);
    case "project.transition":
      return transitionProject(s, intention.projectId, intention.toStatus);
    case "project.create_version":
      return createVersion(s, intention.projectId, intention.input);
    case "project.register_deliverable":
      return registerDeliverable(s, intention.projectId, intention.input);
    case "project.timeline":
      return listTimeline(s, intention.projectId, intention.limit);
    case "agent.register":
      return registerAgent(s, intention.manifest);
    case "agent.list":
      return listAgents(s);
    case "agent.resolve":
      return resolveAgentsByCapability(s, intention.capability);
    case "agent.run.create":
      return createAgentRun(s, intention.input);
    case "agent.run.execute":
      return executeAgentRun(s, intention.runId);
    case "agent.run.cancel":
      return cancelAgentRun(s, intention.runId);
    case "agent.run.get":
      return getAgentRun(s, intention.runId);
    case "agent.bootstrap_web":
      return bootstrapWebAgents(s);
    case "review.create":
      return createReview(s, intention.input);
    case "review.revoke":
      return revokeReview(s, intention.reviewId);
    default: {
      const _exhaustive: never = intention;
      void _exhaustive;
      throw new JarvisError("invalid_intention", "unknown_intention");
    }
  }
}

/** Convenience: machine subject shaped for JARVIS ceiling (B1). */
export function jarvisMachineSubject(id = "jarvis:1"): Subject {
  return { type: "machine", id, principalType: "jarvis" };
}
