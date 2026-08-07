/**
 * Ops session cookie bridge (admin HTML uses localStorage; middleware needs cookies).
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { subjectFromUser, type HumanSubject } from "./auth";
import { can } from "./permission-manager";
import type { HumanRole } from "./roles";
import { roleFromUser } from "./auth";

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

export async function fetchSupabaseUser(accessToken: string): Promise<{
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
} | null> {
  const anon = String(process.env.SUPABASE_ANON_KEY || "").trim();
  if (!anon || !accessToken) return null;
  try {
    const res = await fetch(SUPABASE_URL + "/auth/v1/user", {
      headers: {
        Authorization: "Bearer " + accessToken,
        apikey: anon,
      },
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
  if (!can(subject, "ops.access").allowed) return null;
  return {
    id: user.id,
    email: user.email,
    role,
    subject,
    accessToken,
  };
}

export function readOpsToken(req: NextRequest): string {
  const fromCookie = req.cookies.get(OPS_COOKIE)?.value || "";
  if (fromCookie) return fromCookie;
  const auth = req.headers.get("authorization") || "";
  return auth.replace(/^Bearer\s+/i, "").trim();
}

export function setOpsCookie(res: NextResponse, token: string): void {
  res.cookies.set({
    name: OPS_COOKIE,
    value: token,
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

export const PROTECTED_HTML = [
  "/dashboard.html",
  "/clientes.html",
  "/ajustes.html",
  "/chatbot.html",
  "/jarvis.html",
  "/agentes.html",
] as const;
