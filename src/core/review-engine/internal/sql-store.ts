/**
 * @internal Supabase persistence for Review Engine (ADR-016).
 */

import { ReviewError } from "../errors";
import type { ReviewStatus } from "../states";
import type {
  ReviewComment,
  ReviewDeliverableSnapshot,
  ReviewEvent,
  ReviewSession,
  ReviewTokenRecord,
} from "../types";
import type { ActorRef, ReviewStore } from "./store";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://soeyfivsuwohuuzgfqar.supabase.co";

function serviceKey(): string {
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!key) {
    throw new ReviewError("persistence_error", "missing_service_role");
  }
  return key;
}

async function rest<T>(
  path: string,
  init: RequestInit & { prefer?: string } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    apikey: serviceKey(),
    Authorization: `Bearer ${serviceKey()}`,
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (init.prefer) headers.Prefer = init.prefer;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers,
  });
  if (!res.ok) {
    throw new ReviewError("persistence_error", `supabase_${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function mapReview(row: Record<string, unknown>): ReviewSession {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    versionId: String(row.version_id),
    status: row.status as ReviewStatus,
    expiresAt: String(row.expires_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    createdBy: row.created_by ? String(row.created_by) : null,
    createdByType: row.created_by_type ? String(row.created_by_type) : null,
    revokedAt: row.revoked_at ? String(row.revoked_at) : null,
  };
}

function mapToken(row: Record<string, unknown>): ReviewTokenRecord {
  return {
    id: String(row.id),
    reviewId: String(row.review_id),
    tokenHash: String(row.token_hash),
    expiresAt: String(row.expires_at),
    revokedAt: row.revoked_at ? String(row.revoked_at) : null,
    createdAt: String(row.created_at),
  };
}

function mapDeliverable(row: Record<string, unknown>): ReviewDeliverableSnapshot {
  return {
    deliverableId: String(row.deliverable_id),
    title: String(row.title),
    kind: String(row.kind),
    uri: row.uri ? String(row.uri) : null,
    metadata: (row.metadata as Record<string, unknown>) || {},
  };
}

function mapComment(row: Record<string, unknown>): ReviewComment {
  return {
    id: String(row.id),
    reviewId: String(row.review_id),
    authorType: row.author_type as "client" | "ops",
    body: String(row.body),
    createdAt: String(row.created_at),
  };
}

function mapEvent(row: Record<string, unknown>): ReviewEvent {
  return {
    id: String(row.id),
    reviewId: String(row.review_id),
    event: String(row.event),
    metadata: (row.metadata as Record<string, unknown>) || {},
    createdAt: String(row.created_at),
  };
}

export function createSqlReviewStore(): ReviewStore {
  return {
    async createReview(input) {
      const rows = await rest<Record<string, unknown>[]>("reviews", {
        method: "POST",
        prefer: "return=representation",
        body: JSON.stringify({
          project_id: input.projectId,
          version_id: input.versionId,
          status: input.status,
          expires_at: input.expiresAt,
          created_by: input.actor.actorId,
          created_by_type: input.actor.actorType,
        }),
      });
      const review = mapReview(rows[0]);

      if (input.deliverables.length) {
        await rest("review_deliverables", {
          method: "POST",
          prefer: "return=minimal",
          body: JSON.stringify(
            input.deliverables.map((d) => ({
              review_id: review.id,
              deliverable_id: d.deliverableId,
              title: d.title,
              kind: d.kind,
              uri: d.uri,
              metadata: d.metadata ?? {},
            }))
          ),
        });
      }

      let token: ReviewTokenRecord | null = null;
      if (input.tokenHash) {
        const trows = await rest<Record<string, unknown>[]>("review_tokens", {
          method: "POST",
          prefer: "return=representation",
          body: JSON.stringify({
            review_id: review.id,
            token_hash: input.tokenHash,
            expires_at: input.expiresAt,
          }),
        });
        token = mapToken(trows[0]);
      }

      return {
        review,
        deliverables: input.deliverables,
        token,
      };
    },

    async getReview(id) {
      const rows = await rest<Record<string, unknown>[]>(
        `reviews?id=eq.${encodeURIComponent(id)}&select=*&limit=1`
      );
      return rows[0] ? mapReview(rows[0]) : null;
    },

    async listReviewsByProject(projectId) {
      const rows = await rest<Record<string, unknown>[]>(
        `reviews?project_id=eq.${encodeURIComponent(projectId)}&select=*&order=created_at.desc`
      );
      return rows.map(mapReview);
    },

    async findByTokenHash(tokenHash) {
      const trows = await rest<Record<string, unknown>[]>(
        `review_tokens?token_hash=eq.${encodeURIComponent(tokenHash)}&select=*&limit=1`
      );
      if (!trows[0]) return null;
      const token = mapToken(trows[0]);
      const review = await this.getReview(token.reviewId);
      if (!review) return null;
      return { review, token };
    },

    async updateStatus(id, from, to, patch) {
      const body: Record<string, unknown> = {
        status: to,
        updated_at: new Date().toISOString(),
      };
      if (patch?.revokedAt !== undefined) body.revoked_at = patch.revokedAt;

      const rows = await rest<Record<string, unknown>[]>(
        `reviews?id=eq.${encodeURIComponent(id)}&status=eq.${encodeURIComponent(from)}`,
        {
          method: "PATCH",
          prefer: "return=representation",
          body: JSON.stringify(body),
        }
      );
      if (!rows[0]) {
        throw new ReviewError("conflict", "review_status_conflict", 409);
      }
      return mapReview(rows[0]);
    },

    async revokeToken(reviewId, revokedAt) {
      await rest(
        `review_tokens?review_id=eq.${encodeURIComponent(reviewId)}&revoked_at=is.null`,
        {
          method: "PATCH",
          prefer: "return=minimal",
          body: JSON.stringify({ revoked_at: revokedAt }),
        }
      );
    },

    async listDeliverables(reviewId) {
      const rows = await rest<Record<string, unknown>[]>(
        `review_deliverables?review_id=eq.${encodeURIComponent(reviewId)}&select=*&order=created_at.asc`
      );
      return rows.map(mapDeliverable);
    },

    async addComment(reviewId, authorType, body) {
      const rows = await rest<Record<string, unknown>[]>("review_comments", {
        method: "POST",
        prefer: "return=representation",
        body: JSON.stringify({
          review_id: reviewId,
          author_type: authorType,
          body,
        }),
      });
      return mapComment(rows[0]);
    },

    async listComments(reviewId) {
      const rows = await rest<Record<string, unknown>[]>(
        `review_comments?review_id=eq.${encodeURIComponent(reviewId)}&select=*&order=created_at.asc`
      );
      return rows.map(mapComment);
    },

    async appendEvent(reviewId, event, metadata = {}) {
      const rows = await rest<Record<string, unknown>[]>("review_events", {
        method: "POST",
        prefer: "return=representation",
        body: JSON.stringify({
          review_id: reviewId,
          event,
          metadata,
        }),
      });
      return mapEvent(rows[0]);
    },

    async listEvents(reviewId) {
      const rows = await rest<Record<string, unknown>[]>(
        `review_events?review_id=eq.${encodeURIComponent(reviewId)}&select=*&order=created_at.asc`
      );
      return rows.map(mapEvent);
    },

    async attachToken(reviewId, tokenHash, expiresAt) {
      const rows = await rest<Record<string, unknown>[]>("review_tokens", {
        method: "POST",
        prefer: "return=representation",
        body: JSON.stringify({
          review_id: reviewId,
          token_hash: tokenHash,
          expires_at: expiresAt,
        }),
      });
      return mapToken(rows[0]);
    },
  };
}
