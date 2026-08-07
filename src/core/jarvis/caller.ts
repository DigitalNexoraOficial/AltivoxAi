/**
 * JARVIS Core caller — orchestrator only (Bloque 4 · ADR-014).
 *
 * Chain: JARVIS → Subject → can() (inside PE use-cases) → use-case → PE.
 * Does not import PE internal repository or Supabase clients.
 * Must not use elevated DB credentials; authz stays in PE use-cases via can().
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
import type { Subject } from "@/core/security";
import { JarvisError, type JarvisIntention } from "./types";

function assertSubject(subject: Subject | null | undefined): Subject {
  if (!subject || (subject.type !== "human" && subject.type !== "machine")) {
    throw new JarvisError("invalid_subject", "missing_or_invalid_subject");
  }
  return subject;
}

/**
 * Execute one internal intention by delegating to Project Engine use-cases.
 * Authorization remains inside each use-case via can(subject, action, resource).
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
