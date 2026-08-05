/**
 * Brand image proxy for Instagram publishing.
 * GET /api/ig-image?topic=chatbot&seed=123
 *
 * Generates an AltivoxAI-styled image and serves it from this domain
 * so Meta/Instagram can fetch a stable public URL.
 */

const TOPICS = {
  chatbot: "chatbot web capturing leads for Spanish SMEs",
  leads: "lead automation CRM alerts and hot queue dashboard",
  agents: "AI agents operating 24/7 for business support",
  web: "modern web apps and cloud automation dashboard",
};

function buildPrompt(topicKey) {
  const topic = TOPICS[topicKey] || TOPICS.chatbot;
  return [
    "Instagram square 1080x1080 brand visual for AltivoxAI",
    "Spanish AI automation agency website style like altivoxai.es",
    "dark black background with electric blue and cyan neon glow",
    "futuristic neural network and chatbot interface abstract",
    "premium tech SaaS aesthetic, cinematic lighting",
    "clean composition, high contrast, sharp details",
    "no text, no letters, no logo, no watermark",
    topic,
  ].join(", ");
}

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

  try {
    const topic = String(req.query.topic || "chatbot").toLowerCase();
    const seed = String(req.query.seed || Date.now());
    const prompt = encodeURIComponent(buildPrompt(topic));
    const upstream =
      "https://image.pollinations.ai/prompt/" +
      prompt +
      "?width=1080&height=1080&nologo=true&refine=true&seed=" +
      encodeURIComponent(seed);

    const upstreamRes = await fetch(upstream, {
      headers: { Accept: "image/*" },
    });

    if (!upstreamRes.ok) {
      res.status(502).json({
        error: "No se pudo generar la imagen",
        status: upstreamRes.status,
      });
      return;
    }

    const contentType = upstreamRes.headers.get("content-type") || "image/jpeg";
    const buffer = Buffer.from(await upstreamRes.arrayBuffer());

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    res.status(200).send(buffer);
  } catch (err) {
    res.status(500).json({
      error: "Error generando imagen de marca",
      detail: String(err && err.message ? err.message : err),
    });
  }
};
