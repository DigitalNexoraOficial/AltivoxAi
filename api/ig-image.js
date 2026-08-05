/**
 * Brand image endpoint for Instagram publishing.
 * GET /api/ig-image?topic=chatbot|leads|agents|web
 *
 * Serves static AltivoxAI-styled creatives hosted on this domain so
 * Meta/Instagram can reliably fetch a public image URL.
 */

const TOPIC_PATHS = {
  chatbot: "/assets/ig/chatbot.png",
  leads: "/assets/ig/leads.png",
  agents: "/assets/ig/agents.png",
  web: "/assets/ig/chatbot.png",
};

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const host = req.headers["x-forwarded-host"] || req.headers.host || "www.altivoxai.es";
  const proto = req.headers["x-forwarded-proto"] || "https";
  const topic = String(req.query.topic || "chatbot").toLowerCase();
  const assetPath = TOPIC_PATHS[topic] || TOPIC_PATHS.chatbot;
  const absoluteUrl = proto + "://" + host + assetPath;

  // Redirect to the static asset (stable public URL for Instagram Graph API)
  res.writeHead(302, {
    Location: absoluteUrl,
    "Cache-Control": "public, max-age=300",
  });
  res.end();
};
