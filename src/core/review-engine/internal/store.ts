/**
 * In-memory + optional SQL persistence for Review Engine (Bloque 6).
 */

import { randomUUID } from "node:crypto";
import { ReviewError } from "../errors";
import type { ReviewStatus } from "../states";
import type {
  ReviewComment,
  ReviewDeliverableSnapshot,
  ReviewEvent,
  ReviewSession,
  ReviewTokenRecord,
} from "../types";
import { createSqlReviewStore } from "./sql-store";

function now() {
  return new Date().toISOString();
}

export type ActorRef = { actorType: string; actorId: string };

export type ReviewStore = {
  createReview(input: {
    projectId: string;
    versionId: string;
    status: ReviewStatus;
    expiresAt: string;
    deliverables: ReviewDeliverableSnapshot[];
    tokenHash: string | null;
    actor: ActorRef;
  }): Promise<{
    review: ReviewSession;
    deliverables: ReviewDeliverableSnapshot[];
    token: ReviewTokenRecord | null;
  }>;
  getReview(id: string): Promise<ReviewSession | null>;
  listReviewsByProject(projectId: string): Promise<ReviewSession[]>;
  findByTokenHash(tokenHash: string): Promise<{
    review: ReviewSession;
    token: ReviewTokenRecord;
  } | null>;
  updateStatus(
    id: string,
    from: ReviewStatus,
    to: ReviewStatus,
    patch?: { revokedAt?: string | null }
  ): Promise<ReviewSession>;
  revokeToken(reviewId: string, revokedAt: string): Promise<void>;
  listDeliverables(reviewId: string): Promise<ReviewDeliverableSnapshot[]>;
  addComment(
    reviewId: string,
    authorType: "client" | "ops",
    body: string
  ): Promise<ReviewComment>;
  listComments(reviewId: string): Promise<ReviewComment[]>;
  appendEvent(
    reviewId: string,
    event: string,
    metadata?: Record<string, unknown>
  ): Promise<ReviewEvent>;
  listEvents(reviewId: string): Promise<ReviewEvent[]>;
  attachToken(
    reviewId: string,
    tokenHash: string,
    expiresAt: string
  ): Promise<ReviewTokenRecord>;
};

export function createMemoryReviewStore(): ReviewStore {
  const reviews = new Map<string, ReviewSession>();
  const tokens = new Map<string, ReviewTokenRecord>(); // by reviewId (one active)
  const tokensByHash = new Map<string, string>(); // hash → reviewId
  const deliverables = new Map<string, ReviewDeliverableSnapshot[]>();
  const comments = new Map<string, ReviewComment[]>();
  const events = new Map<string, ReviewEvent[]>();

  return {
    async createReview(input) {
      const ts = now();
      const id = randomUUID();
      const review: ReviewSession = {
        id,
        projectId: input.projectId,
        versionId: input.versionId,
        status: input.status,
        expiresAt: input.expiresAt,
        createdAt: ts,
        updatedAt: ts,
        createdBy: input.actor.actorId,
        createdByType: input.actor.actorType,
        revokedAt: null,
      };
      reviews.set(id, review);
      deliverables.set(id, input.deliverables.map((d) => ({ ...d, metadata: { ...d.metadata } })));
      comments.set(id, []);
      events.set(id, []);

      let token: ReviewTokenRecord | null = null;
      if (input.tokenHash) {
        token = {
          id: randomUUID(),
          reviewId: id,
          tokenHash: input.tokenHash,
          expiresAt: input.expiresAt,
          revokedAt: null,
          createdAt: ts,
        };
        tokens.set(id, token);
        tokensByHash.set(input.tokenHash, id);
      }
      return { review, deliverables: deliverables.get(id)!, token };
    },

    async getReview(id) {
      return reviews.get(id) ?? null;
    },

    async listReviewsByProject(projectId) {
      return [...reviews.values()]
        .filter((r) => r.projectId === projectId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    async findByTokenHash(tokenHash) {
      const reviewId = tokensByHash.get(tokenHash);
      if (!reviewId) return null;
      const review = reviews.get(reviewId);
      const token = tokens.get(reviewId);
      if (!review || !token) return null;
      return { review, token };
    },

    async updateStatus(id, from, to, patch) {
      const review = reviews.get(id);
      if (!review) throw new ReviewError("not_found", "review_not_found");
      if (review.status !== from) {
        throw new ReviewError("conflict", "review_status_conflict", 409);
      }
      const next: ReviewSession = {
        ...review,
        status: to,
        updatedAt: now(),
        revokedAt:
          patch?.revokedAt !== undefined ? patch.revokedAt : review.revokedAt,
      };
      reviews.set(id, next);
      return next;
    },

    async revokeToken(reviewId, revokedAt) {
      const token = tokens.get(reviewId);
      if (!token) return;
      const next = { ...token, revokedAt };
      tokens.set(reviewId, next);
    },

    async listDeliverables(reviewId) {
      return [...(deliverables.get(reviewId) ?? [])];
    },

    async addComment(reviewId, authorType, body) {
      if (!reviews.has(reviewId)) {
        throw new ReviewError("not_found", "review_not_found");
      }
      const c: ReviewComment = {
        id: randomUUID(),
        reviewId,
        authorType,
        body,
        createdAt: now(),
      };
      const list = comments.get(reviewId) ?? [];
      list.push(c);
      comments.set(reviewId, list);
      return c;
    },

    async listComments(reviewId) {
      return [...(comments.get(reviewId) ?? [])];
    },

    async appendEvent(reviewId, event, metadata = {}) {
      if (!reviews.has(reviewId)) {
        throw new ReviewError("not_found", "review_not_found");
      }
      const e: ReviewEvent = {
        id: randomUUID(),
        reviewId,
        event,
        metadata,
        createdAt: now(),
      };
      const list = events.get(reviewId) ?? [];
      list.push(e);
      events.set(reviewId, list);
      return e;
    },

    async listEvents(reviewId) {
      return [...(events.get(reviewId) ?? [])];
    },

    async attachToken(reviewId, tokenHash, expiresAt) {
      if (!reviews.has(reviewId)) {
        throw new ReviewError("not_found", "review_not_found");
      }
      const existing = tokens.get(reviewId);
      if (existing) {
        tokensByHash.delete(existing.tokenHash);
      }
      const token: ReviewTokenRecord = {
        id: randomUUID(),
        reviewId,
        tokenHash,
        expiresAt,
        revokedAt: null,
        createdAt: now(),
      };
      tokens.set(reviewId, token);
      tokensByHash.set(tokenHash, reviewId);
      return token;
    },
  };
}

let activeStore: ReviewStore = createMemoryReviewStore();
let sqlStore: ReviewStore | null = null;

function shouldUseSql(): boolean {
  if (process.env.ALTIVOX_SELFTEST === "1") return false;
  if (process.env.ALTIVOX_REVIEW_STORE === "memory") return false;
  return Boolean(String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim());
}

export function getReviewStore(): ReviewStore {
  if (shouldUseSql()) {
    if (!sqlStore) sqlStore = createSqlReviewStore();
    return sqlStore;
  }
  return activeStore;
}

export function setReviewStoreForTests(store: ReviewStore | null): void {
  activeStore = store ?? createMemoryReviewStore();
}

export function resetReviewStoreForTests(): void {
  activeStore = createMemoryReviewStore();
}
