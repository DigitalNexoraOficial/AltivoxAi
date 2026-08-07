/**
 * Review Engine use-cases (Bloque 6 · ADR-016).
 *
 * Ops/JARVIS → can(review.*) → Review Engine.
 * Client → token → Review Engine (no staff session).
 * Never mutates PE / Agent Runtime.
 */

import { can, type Subject } from "@/core/security";
import { ReviewError } from "./errors";
import { getProjectGate } from "./internal/project-gate";
import { getReviewStore } from "./internal/store";
import {
  generateReviewTokenPlaintext,
  hashReviewToken,
  isExpired,
} from "./internal/token";
import {
  canClientAct,
  canTransitionReview,
  isTerminalStatus,
  type ReviewStatus,
} from "./states";
import type {
  CreateReviewInput,
  ReviewClientView,
  ReviewDeliverableSnapshot,
  ReviewOpsView,
  ReviewSession,
} from "./types";

function actor(subject: Subject) {
  return { actorType: subject.type, actorId: subject.id };
}

function assertCan(subject: Subject, action: string): void {
  const d = can(subject, action);
  if (!d.allowed) throw new ReviewError("forbidden", d.reason, 403);
}

function defaultExpiry(iso?: string): string {
  if (iso) {
    const t = Date.parse(iso);
    if (Number.isNaN(t) || t <= Date.now()) {
      throw new ReviewError("invalid_input", "expires_at_invalid");
    }
    return new Date(t).toISOString();
  }
  return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
}

function normalizeDeliverables(
  raw: ReviewDeliverableSnapshot[] | undefined
): ReviewDeliverableSnapshot[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new ReviewError("invalid_input", "deliverables_required");
  }
  return raw.map((d, i) => {
    const deliverableId = String(d?.deliverableId || "").trim();
    const title = String(d?.title || "").trim();
    const kind = String(d?.kind || "artifact").trim() || "artifact";
    if (!deliverableId) {
      throw new ReviewError("invalid_input", `deliverable_id_required:${i}`);
    }
    if (!title) {
      throw new ReviewError("invalid_input", `deliverable_title_required:${i}`);
    }
    const uri =
      d?.uri === null || d?.uri === undefined
        ? null
        : String(d.uri).trim() || null;
    const metadata =
      d?.metadata && typeof d.metadata === "object" && !Array.isArray(d.metadata)
        ? sanitizeClientMetadata(d.metadata)
        : {};
    return { deliverableId, title, kind, uri, metadata };
  });
}

/** Strip keys that must never leak to the portal. */
function sanitizeClientMetadata(
  meta: Record<string, unknown>
): Record<string, unknown> {
  const blocked = /agent|prompt|run|memory|tool|credential|secret|service_role|ops/i;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (blocked.test(k)) continue;
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      out[k] = v;
    } else if (v === null) {
      out[k] = null;
    }
  }
  return out;
}

async function toOpsView(
  review: ReviewSession,
  extras?: { token?: string }
): Promise<ReviewOpsView> {
  const store = getReviewStore();
  const [deliverables, comments, events] = await Promise.all([
    store.listDeliverables(review.id),
    store.listComments(review.id),
    store.listEvents(review.id),
  ]);
  const view: ReviewOpsView = { review, deliverables, comments, events };
  if (extras?.token) {
    view.token = extras.token;
    view.portalPath = `/r/${extras.token}`;
  }
  return view;
}

function toClientView(
  review: ReviewSession,
  deliverables: ReviewDeliverableSnapshot[],
  comments: Awaited<ReturnType<ReturnType<typeof getReviewStore>["listComments"]>>
): ReviewClientView {
  return {
    reviewId: review.id,
    status: review.status,
    expiresAt: review.expiresAt,
    projectId: review.projectId,
    versionId: review.versionId,
    deliverables: deliverables.map((d) => ({
      deliverableId: d.deliverableId,
      title: d.title,
      kind: d.kind,
      uri: d.uri,
      metadata: sanitizeClientMetadata(d.metadata),
    })),
    comments: comments
      .filter((c) => c.authorType === "client" || c.authorType === "ops")
      .map((c) => ({
        id: c.id,
        body: c.body,
        createdAt: c.createdAt,
      })),
  };
}

export async function createReview(
  subject: Subject,
  input: CreateReviewInput
): Promise<ReviewOpsView> {
  assertCan(subject, "review.create");

  const projectId = String(input.projectId || "").trim();
  const versionId = String(input.versionId || "").trim();
  if (!projectId) throw new ReviewError("invalid_input", "project_id_required");
  if (!versionId) throw new ReviewError("invalid_input", "version_id_required");
  // Reject labels like "v1" before PostgREST (uuid columns).
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRe.test(projectId)) {
    throw new ReviewError("invalid_input", "project_id_must_be_uuid");
  }
  if (!uuidRe.test(versionId)) {
    throw new ReviewError(
      "invalid_input",
      "version_id_must_be_uuid_not_label"
    );
  }

  await getProjectGate()(subject, projectId);

  const deliverables = normalizeDeliverables(input.deliverables);
  const expiresAt = defaultExpiry(input.expiresAt);
  const activate = input.activate !== false;

  const plaintext = activate ? generateReviewTokenPlaintext() : null;
  const tokenHash = plaintext ? hashReviewToken(plaintext) : null;
  const status: ReviewStatus = activate ? "sent" : "draft";

  const store = getReviewStore();
  const created = await store.createReview({
    projectId,
    versionId,
    status,
    expiresAt,
    deliverables,
    tokenHash,
    actor: actor(subject),
  });

  await store.appendEvent(created.review.id, "review.created", {
    status,
    projectId,
    versionId,
    deliverableCount: deliverables.length,
  });
  if (activate) {
    await store.appendEvent(created.review.id, "review.sent", {});
  }

  return toOpsView(created.review, plaintext ? { token: plaintext } : undefined);
}

export async function getReviewForOps(
  subject: Subject,
  reviewId: string
): Promise<ReviewOpsView> {
  if (!can(subject, "project.read").allowed && !can(subject, "review.create").allowed) {
    throw new ReviewError("forbidden", "review_read_denied", 403);
  }
  const review = await getReviewStore().getReview(reviewId);
  if (!review) throw new ReviewError("not_found", "review_not_found");
  return toOpsView(review);
}

export async function listReviewsForProject(
  subject: Subject,
  projectId: string
): Promise<ReviewSession[]> {
  if (!can(subject, "project.read").allowed && !can(subject, "review.create").allowed) {
    throw new ReviewError("forbidden", "review_list_denied", 403);
  }
  const id = String(projectId || "").trim();
  if (!id) throw new ReviewError("invalid_input", "project_id_required");
  return getReviewStore().listReviewsByProject(id);
}

export async function revokeReview(
  subject: Subject,
  reviewId: string
): Promise<ReviewOpsView> {
  assertCan(subject, "review.revoke");
  const store = getReviewStore();
  const review = await store.getReview(reviewId);
  if (!review) throw new ReviewError("not_found", "review_not_found");
  if (review.status === "revoked") {
    return toOpsView(review);
  }
  if (!canTransitionReview(review.status, "revoked")) {
    throw new ReviewError(
      "invalid_transition",
      `cannot_revoke:${review.status}`
    );
  }
  const revokedAt = new Date().toISOString();
  const next = await store.updateStatus(review.id, review.status, "revoked", {
    revokedAt,
  });
  await store.revokeToken(review.id, revokedAt);
  await store.appendEvent(review.id, "review.revoked", {
    by: subject.id,
  });
  return toOpsView(next);
}

async function resolveTokenSession(plaintext: string) {
  const raw = String(plaintext || "").trim();
  if (!raw) throw new ReviewError("invalid_token", "token_required");

  const store = getReviewStore();
  const found = await store.findByTokenHash(hashReviewToken(raw));
  if (!found) throw new ReviewError("invalid_token", "token_unknown");

  const { review, token } = found;
  if (token.revokedAt || review.status === "revoked" || review.revokedAt) {
    throw new ReviewError("token_revoked", "token_revoked");
  }
  if (isExpired(token.expiresAt) || isExpired(review.expiresAt)) {
    throw new ReviewError("token_expired", "token_expired");
  }
  return { store, review, token };
}

export async function getReviewByToken(
  plaintextToken: string
): Promise<ReviewClientView> {
  const { store, review } = await resolveTokenSession(plaintextToken);

  let current = review;
  if (current.status === "sent" && canTransitionReview("sent", "viewed")) {
    current = await store.updateStatus(current.id, "sent", "viewed");
    await store.appendEvent(current.id, "review.viewed", {});
  }

  const [deliverables, comments] = await Promise.all([
    store.listDeliverables(current.id),
    store.listComments(current.id),
  ]);
  return toClientView(current, deliverables, comments);
}

export async function commentOnReview(
  plaintextToken: string,
  body: string
): Promise<ReviewClientView> {
  const { store, review } = await resolveTokenSession(plaintextToken);
  if (!canClientAct(review.status)) {
    throw new ReviewError(
      "invalid_transition",
      `cannot_comment:${review.status}`
    );
  }
  const text = String(body || "").trim();
  if (!text || text.length > 4000) {
    throw new ReviewError("invalid_input", "comment_body_invalid");
  }
  await store.addComment(review.id, "client", text);
  await store.appendEvent(review.id, "review.commented", {
    length: text.length,
  });
  const [deliverables, comments] = await Promise.all([
    store.listDeliverables(review.id),
    store.listComments(review.id),
  ]);
  return toClientView(review, deliverables, comments);
}

async function clientDecision(
  plaintextToken: string,
  to: "changes_requested" | "approved" | "rejected",
  event: string
): Promise<ReviewClientView> {
  const { store, review } = await resolveTokenSession(plaintextToken);
  if (isTerminalStatus(review.status)) {
    throw new ReviewError(
      "invalid_transition",
      `cannot_decide:${review.status}`
    );
  }
  // Ensure viewed semantics if still sent
  let from = review.status;
  let current = review;
  if (from === "sent") {
    current = await store.updateStatus(current.id, "sent", "viewed");
    from = "viewed";
    await store.appendEvent(current.id, "review.viewed", {});
  }
  if (!canTransitionReview(from, to)) {
    throw new ReviewError("invalid_transition", `cannot_${to}:${from}`);
  }
  current = await store.updateStatus(current.id, from, to);
  await store.appendEvent(current.id, event, {});
  // Client decision stays in Review Engine only (never mutates PE project status).
  const [deliverables, comments] = await Promise.all([
    store.listDeliverables(current.id),
    store.listComments(current.id),
  ]);
  return toClientView(current, deliverables, comments);
}

export async function requestChangesOnReview(
  plaintextToken: string
): Promise<ReviewClientView> {
  return clientDecision(
    plaintextToken,
    "changes_requested",
    "review.changes_requested"
  );
}

export async function approveReview(
  plaintextToken: string
): Promise<ReviewClientView> {
  return clientDecision(plaintextToken, "approved", "review.approved");
}

export async function rejectReview(
  plaintextToken: string
): Promise<ReviewClientView> {
  return clientDecision(plaintextToken, "rejected", "review.rejected");
}
