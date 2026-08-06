/**
 * Brand image endpoint for Instagram publishing.
 * GET /api/ig-image?topic=chatbot|leads|agents|web
 *
 * Always redirects to a fixed allowlisted host (no Host-header open redirect).
 */

import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOST = "www.altivoxai.es";

const TOPIC_PATHS: Record<string, string> = {
  chatbot: "/assets/ig/chatbot.png",
  leads: "/assets/ig/leads.png",
  agents: "/assets/ig/agents.png",
  web: "/assets/ig/chatbot.png",
};

function withCors(res: NextResponse): NextResponse {
  res.headers.set("Access-Control-Allow-Origin", "https://www.altivoxai.es");
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.headers.set("Vary", "Origin");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET(req: NextRequest) {
  const topic = String(req.nextUrl.searchParams.get("topic") || "chatbot").toLowerCase();
  const assetPath = TOPIC_PATHS[topic] || TOPIC_PATHS.chatbot;
  const absoluteUrl = "https://" + ALLOWED_HOST + assetPath;

  const res = NextResponse.redirect(absoluteUrl, 302);
  res.headers.set("Cache-Control", "public, max-age=300");
  return withCors(res);
}
