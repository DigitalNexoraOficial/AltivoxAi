import { NextRequest, NextResponse } from "next/server";
import {
  isOpsProtectedPath,
  resolveOpsUserFromToken,
  OPS_COOKIE,
} from "@/core/security/session";

/**
 * Gate admin HTML / future /ops.
 * Cookie `altivox_ops_token` is only a transport for the Supabase access token.
 * Access requires live Supabase session validation + Permission Manager (ops.access).
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isOpsProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // Prefer Authorization if present; otherwise cookie transport.
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.replace(/^Bearer\s+/i, "").trim();
  const cookieToken = req.cookies.get(OPS_COOKIE)?.value || "";
  const token = bearer || cookieToken;

  const isOpsApi = pathname.startsWith("/api/ops/");

  if (!token) {
    if (isOpsApi) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const login = new URL("/login.html", req.url);
    login.searchParams.set("next", pathname);
    login.searchParams.set("error", "auth_required");
    return NextResponse.redirect(login);
  }

  // Source of truth: Supabase Auth + can(ops.access) — never the cookie alone.
  const user = await resolveOpsUserFromToken(token);
  if (!user) {
    if (isOpsApi) {
      const res = NextResponse.json({ error: "forbidden" }, { status: 403 });
      if (cookieToken) {
        res.cookies.set({ name: OPS_COOKIE, value: "", path: "/", maxAge: 0 });
      }
      return res;
    }
    const login = new URL("/login.html", req.url);
    login.searchParams.set("error", "forbidden");
    const res = NextResponse.redirect(login);
    res.cookies.set({ name: OPS_COOKIE, value: "", path: "/", maxAge: 0 });
    return res;
  }

  // Do NOT forward role/id as request headers — clients could spoof them on
  // unmatched routes. APIs must call resolveOpsUserFromToken / can() themselves.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard.html",
    "/clientes.html",
    "/ajustes.html",
    "/chatbot.html",
    "/jarvis.html",
    "/agentes.html",
    "/ops",
    "/ops/:path*",
    "/api/ops/:path*",
  ],
};
