/**
 * Brand image endpoint for Instagram publishing.
 * GET /api/ig-image?topic=chatbot|leads|agents|web
 *
 * Always redirects to a fixed allowlisted host (no Host-header open redirect).
 */

const ALLOWED_HOST = "www.altivoxai.es";

const TOPIC_PATHS = {
  chatbot: "/assets/ig/chatbot.png",
  leads: "/assets/ig/leads.png",
  agents: "/assets/ig/agents.png",
  web: "/assets/ig/chatbot.png",
};

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://www.altivoxai.es");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const topic = String(req.query.topic || "chatbot").toLowerCase();
  const assetPath = TOPIC_PATHS[topic] || TOPIC_PATHS.chatbot;
  const absoluteUrl = "https://" + ALLOWED_HOST + assetPath;

  res.writeHead(302, {
    Location: absoluteUrl,
    "Cache-Control": "public, max-age=300",
  });
  res.end();
};
