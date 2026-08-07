/**
 * Ops session: cookie is ONLY a transport for the Supabase access token
 * so Edge middleware can read it (admin HTML keeps the session in localStorage).
 *
 * Authorization truth = Supabase Auth /auth/v1/user + Permission Manager can().
 * The cookie value alone never grants access.
 */

import { NextResponse } from "next/server";
import { subjectFromUser, roleFromUser } from "./auth";
import { can, type HumanSubject } from "./permission-manager";
import type { HumanRole } from "./roles";

export const OPS_COOKIE = "altivox_ops_token";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://soeyfivsuwohuuzgfqar.supabase.co";

export type ResolvedOpsUser = {
  id: string;
  email?: string;
  role: HumanRole;
  subject: HumanSubject;
  accessToken: string;
};

export const PROTECTED_HTML = [
  "/dashboard.html",
  "/clientes.html",
  "/ajustes.html",
  "/chatbot.html",
  "/jarvis.html",
  "/agentes.html",
] as const;

/** Pure path helper (testable; used by middleware). */
export function isOpsProtectedPath(pathname: string): boolean {
  if ((PROTECTED_HTML as readonly string[]).includes(pathname)) return true;
  if (pathname === "/ops" || pathname.startsWith("/ops/")) return true;
  if (pathname.startsWith("/api/ops/") && pathname !== "/api/ops/session") {
    return true;
  }
  return false;
}

function looksLikeJwt(token: string): boolean {
  const parts = token.split(".");
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

export async function fetchSupabaseUser(accessToken: string): Promise<{
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
} | null> {
  const anon = String(process.env.SUPABASE_ANON_KEY || "").trim();
  if (!anon || !accessToken || !looksLikeJwt(accessToken)) return null;
  try {
    const res = await fetch(SUPABASE_URL + "/auth/v1/user", {
      headers: {
        Authorization: "Bearer " + accessToken,
        apikey: anon,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const user = (await res.json()) as {
      id: string;
      email?: string;
      app_metadata?: Record<string, unknown>;
    };
    if (!user?.id) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * Resolve staff subject from a Supabase access token (Bearer or cookie transport).
 * Always re-validates with Supabase; always checks can(..., "ops.access").
 */
export async function resolveOpsUserFromToken(
  accessToken: string
): Promise<ResolvedOpsUser | null> {
  const user = await fetchSupabaseUser(accessToken);
  if (!user) return null;
  const role = roleFromUser(user);
  const subject = subjectFromUser({
    id: user.id,
    email: user.email,
    app_metadata: user.app_metadata,
  });
  if (!role || !subject) return null;
  if (!can(subject, "ops.access", { type: "ops" }).allowed) return null;
  return {
    id: user.id,
    email: user.email,
    role,
    subject,
    accessToken,
  };
}

export function setOpsCookie(res: NextResponse, accessToken: string): void {
  // Transport only — expiry is enforced by Supabase when resolving the token.
  res.cookies.set({
    name: OPS_COOKIE,
    value: accessToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export function clearOpsCookie(res: NextResponse): void {
  res.cookies.set({
    name: OPS_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
