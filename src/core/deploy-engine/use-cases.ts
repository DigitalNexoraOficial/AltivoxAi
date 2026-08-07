/**
 * Deploy Engine use-cases (Bloque 7 · ADR-017).
 *
 * OPS/JARVIS → can(deploy.*) → Deploy Engine.
 * ZIP only — no external providers, no Review/Agent imports.
 */

import { can, type Subject } from "@/core/security";
import { DeployError } from "./errors";
import { getProjectGate } from "./internal/project-gate";
import { storePackageBlob } from "./internal/package-store";
import { getDeployStore } from "./internal/repository";
import { buildDeploymentZip } from "./internal/zip-builder";
import {
  canTransitionDeployment,
  isActiveDeployment,
  type DeploymentStatus,
} from "./states";
import type {
  ConfigureDeploymentInput,
  CreateDeploymentInput,
  DeployDeliverableRef,
  Deployment,
  DeploymentView,
} from "./types";

function actor(subject: Subject) {
  return { actorType: subject.type, actorId: subject.id };
}

function assertCan(subject: Subject, action: string): void {
  const d = can(subject, action);
  if (!d.allowed) throw new DeployError("forbidden", d.reason, 403);
}

function normalizeDeliverables(
  raw: DeployDeliverableRef[] | undefined
): DeployDeliverableRef[] {
  if (!raw) return [];
  if (!Array.isArray(raw)) {
    throw new DeployError("invalid_input", "deliverables_invalid");
  }
  return raw.map((d, i) => {
    const deliverableId = String(d?.deliverableId || "").trim();
    const title = String(d?.title || "").trim() || `deliverable-${i + 1}`;
    const kind = String(d?.kind || "artifact").trim() || "artifact";
    if (!deliverableId) {
      throw new DeployError("invalid_input", `deliverable_id_required:${i}`);
    }
    const uri =
      d?.uri === null || d?.uri === undefined
        ? null
        : String(d.uri).trim() || null;
    const content =
      d?.content === null || d?.content === undefined
        ? null
        : String(d.content);
    return { deliverableId, title, kind, uri, content };
  });
}

function sanitizeConfig(
  raw: Record<string, unknown> | undefined
): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const blocked = /agent|prompt|secret|password|credential|service_role|token/i;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (blocked.test(k)) continue;
    if (
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean" ||
      v === null
    ) {
      out[k] = v;
    }
  }
  return out;
}

async function toView(deployment: Deployment): Promise<DeploymentView> {
  const events = await getDeployStore().listEvents(deployment.id);
  return { deployment, events };
}

export async function createDeployment(
  subject: Subject,
  input: CreateDeploymentInput
): Promise<DeploymentView> {
  assertCan(subject, "deploy.create");

  const projectId = String(input.projectId || "").trim();
  const versionId = String(input.versionId || "").trim();
  if (!projectId) throw new DeployError("invalid_input", "project_id_required");
  if (!versionId) throw new DeployError("invalid_input", "version_id_required");

  await getProjectGate()(subject, projectId);

  const deliverables = normalizeDeliverables(input.deliverables);
  const config = sanitizeConfig(input.config);

  const store = getDeployStore();
  const deployment = await store.createDeployment({
    projectId,
    versionId,
    deliverables,
    config,
    actor: actor(subject),
  });
  await store.appendEvent(deployment.id, "deployment.created", {
    projectId,
    versionId,
    deliverableCount: deliverables.length,
  });
  return toView(deployment);
}

export async function getDeployment(
  subject: Subject,
  deploymentId: string
): Promise<DeploymentView> {
  if (
    !can(subject, "deploy.create").allowed &&
    !can(subject, "deploy.execute").allowed &&
    !can(subject, "project.read").allowed
  ) {
    throw new DeployError("forbidden", "deployment_read_denied", 403);
  }
  const deployment = await getDeployStore().getDeployment(deploymentId);
  if (!deployment) throw new DeployError("not_found", "deployment_not_found");
  return toView(deployment);
}

export async function listDeployments(
  subject: Subject,
  filter?: { projectId?: string }
): Promise<Deployment[]> {
  if (
    !can(subject, "deploy.create").allowed &&
    !can(subject, "deploy.execute").allowed &&
    !can(subject, "project.read").allowed
  ) {
    throw new DeployError("forbidden", "deployment_list_denied", 403);
  }
  return getDeployStore().listDeployments(filter);
}

export async function configureDeployment(
  subject: Subject,
  deploymentId: string,
  input: ConfigureDeploymentInput
): Promise<DeploymentView> {
  assertCan(subject, "deploy.configure");
  const store = getDeployStore();
  const deployment = await store.getDeployment(deploymentId);
  if (!deployment) throw new DeployError("not_found", "deployment_not_found");
  if (deployment.status !== "draft") {
    throw new DeployError(
      "invalid_transition",
      `configure_only_draft:${deployment.status}`
    );
  }
  const config = sanitizeConfig({
    ...deployment.config,
    ...(input.config || {}),
  });
  const next = await store.updateConfig(deployment.id, config);
  await store.appendEvent(deployment.id, "deployment.configured", {
    keys: Object.keys(config),
  });
  return toView(next);
}

/**
 * Execute packaging pipeline:
 * draft → queued → building → packaged
 * No external providers.
 */
export async function executeDeployment(
  subject: Subject,
  deploymentId: string
): Promise<DeploymentView> {
  assertCan(subject, "deploy.execute");
  const store = getDeployStore();
  let deployment = await store.getDeployment(deploymentId);
  if (!deployment) throw new DeployError("not_found", "deployment_not_found");

  if (deployment.status !== "draft" && deployment.status !== "failed") {
    // Allow re-queue only from draft; failed stays failed unless cancelled+new
    if (deployment.status === "packaged") {
      return toView(deployment);
    }
    throw new DeployError(
      "invalid_transition",
      `cannot_execute:${deployment.status}`
    );
  }
  if (deployment.status === "failed") {
    throw new DeployError("invalid_transition", "cannot_execute:failed");
  }

  const step = async (from: DeploymentStatus, to: DeploymentStatus) => {
    if (!canTransitionDeployment(from, to)) {
      throw new DeployError("invalid_transition", `cannot_${from}_to_${to}`);
    }
    deployment = await store.updateStatus(deployment!.id, from, to, {
      error: null,
    });
    await store.appendEvent(deployment.id, `deployment.${to}`, {});
  };

  try {
    await step("draft", "queued");
    await step("queued", "building");

    const zip = buildDeploymentZip({
      deploymentId: deployment.id,
      projectId: deployment.projectId,
      versionId: deployment.versionId,
      deliverables: deployment.deliverables,
    });
    const stored = storePackageBlob(deployment.id, zip.buffer, zip.sha256Hex);

    if (!canTransitionDeployment("building", "packaged")) {
      throw new DeployError("invalid_transition", "cannot_building_to_packaged");
    }
    deployment = await store.updateStatus(deployment.id, "building", "packaged", {
      packageUri: stored.uri,
      error: null,
    });
    await store.appendEvent(deployment.id, "deployment.packaged", {
      packageUri: stored.uri,
      sha256: stored.sha256,
      byteLength: stored.byteLength,
    });

    return toView(deployment);
  } catch (err) {
    const message =
      err instanceof DeployError ? err.message : "packaging_failed";
    try {
      const current = await store.getDeployment(deploymentId);
      if (
        current &&
        (current.status === "queued" || current.status === "building") &&
        canTransitionDeployment(current.status, "failed")
      ) {
        await store.updateStatus(current.id, current.status, "failed", {
          error: message,
        });
        await store.appendEvent(current.id, "deployment.failed", { message });
      }
    } catch {
      /* ignore secondary */
    }
    if (err instanceof DeployError) throw err;
    throw new DeployError("packaging_error", message);
  }
}

export async function cancelDeployment(
  subject: Subject,
  deploymentId: string
): Promise<DeploymentView> {
  assertCan(subject, "deploy.cancel");
  const store = getDeployStore();
  const deployment = await store.getDeployment(deploymentId);
  if (!deployment) throw new DeployError("not_found", "deployment_not_found");
  if (!isActiveDeployment(deployment.status)) {
    throw new DeployError(
      "invalid_transition",
      `cannot_cancel:${deployment.status}`
    );
  }
  if (!canTransitionDeployment(deployment.status, "cancelled")) {
    throw new DeployError(
      "invalid_transition",
      `cannot_cancel:${deployment.status}`
    );
  }
  const next = await store.updateStatus(
    deployment.id,
    deployment.status,
    "cancelled",
    { error: null }
  );
  await store.appendEvent(deployment.id, "deployment.cancelled", {
    by: subject.id,
  });
  return toView(next);
}
