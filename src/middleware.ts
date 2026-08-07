import { NextRequest, NextResponse } from "next/server";
import {
  PROTECTED_HTML,
  resolveOpsUserFromToken,
} from "@/core/security/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedHtml = (PROTECTED_HTML as readonly string[]).includes(
    pathname
  );
  const isOpsApp = pathname === "/ops" || pathname.startsWith("/ops/");
  const isOpsApi =
    pathname.startsWith("/api/ops/") && pathname !== "/api/ops/session";

  if (!isProtectedHtml && !isOpsApp && !isOpsApi) {
    return NextResponse.next();
  }

  const token = req.cookies.get("altivox_ops_token")?.value || "";
  if (!token) {
    if (isOpsApi) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const login = new URL("/login.html", req.url);
    login.searchParams.set("next", pathname);
    login.searchParams.set("error", "auth_required");
    return NextResponse.redirect(login);
  }

  const user = await resolveOpsUserFromToken(token);
  if (!user) {
    if (isOpsApi) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const login = new URL("/login.html", req.url);
    login.searchParams.set("error", "forbidden");
    const res = NextResponse.redirect(login);
    res.cookies.set({
      name: "altivox_ops_token",
      value: "",
      path: "/",
      maxAge: 0,
    });
    return res;
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-altivox-user-id", user.id);
  requestHeaders.set("x-altivox-user-role", user.role);
  if (user.email) requestHeaders.set("x-altivox-user-email", user.email);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
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
