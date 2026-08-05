const ALLOWED_ORIGINS = [
  "https://www.altivoxai.es",
  "https://altivoxai.es",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const MAX_MESSAGE_CHARS = 2000;
const rateBucket = new Map();

function pickOrigin(req) {
  const origin = String(req.headers.origin || "");
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  return ALLOWED_ORIGINS[0];
}

function setCors(req, res) {
  res.setHeader("Access-Control-Allow-Origin", pickOrigin(req));
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function clientIp(req) {
  const xf = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return xf || req.socket?.remoteAddress || "unknown";
}

function rateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxHits = 20;
  const entry = rateBucket.get(ip) || { count: 0, start: now };
  if (now - entry.start > windowMs) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  rateBucket.set(ip, entry);
  return entry.count <= maxHits;
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!rateLimit(clientIp(req))) {
    return res.status(429).json({ error: "Demasiadas peticiones. Espera un minuto." });
  }

  try {
    const { message, model, agent, mode } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Falta el mensaje." });
    }

    const cleanMessage = message.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!cleanMessage) {
      return res.status(400).json({ error: "Falta el mensaje." });
    }

    const agentName = String(agent || model || mode || "asistente").slice(0, 60);
    const systemPrompt =
      `Eres ${agentName} del ecosistema AltivoxAi. ` +
      "Responde en el idioma del usuario, de forma clara, profesional y concisa. " +
      "Si detectas interés comercial, pide nombre y email de forma natural.";

    let reply = "";
    let lastError = "";

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey) {
      try {
        const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + openRouterKey,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://www.altivoxai.es",
            "X-Title": "AltivoxAi",
          },
          body: JSON.stringify({
            model: process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: cleanMessage },
            ],
          }),
        });
        const orData = await orRes.json();
        if (orRes.ok) {
          reply =
            (orData.choices &&
              orData.choices[0] &&
              orData.choices[0].message &&
              orData.choices[0].message.content) ||
            "";
        } else {
          lastError =
            (orData.error && (orData.error.message || orData.error)) ||
            "Error OpenRouter";
        }
      } catch (e) {
        lastError = e.message || "Error conectando OpenRouter";
      }
    }

    if (!reply) {
      const geminiKey = process.env.GEMINI_API_KEY;
      if (geminiKey) {
        const modelsToTry = [
          process.env.GEMINI_MODEL || "gemini-2.5-flash",
          "gemini-2.5-flash-lite",
          "gemini-flash-latest",
          "gemini-1.5-flash",
        ];

        for (const modelId of modelsToTry) {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [{ text: `${systemPrompt}\n\nUsuario: ${cleanMessage}` }],
                  },
                ],
              }),
            }
          );
          const data = await geminiRes.json();
          if (geminiRes.ok) {
            reply =
              (data.candidates &&
                data.candidates[0] &&
                data.candidates[0].content &&
                data.candidates[0].content.parts &&
                data.candidates[0].content.parts[0] &&
                data.candidates[0].content.parts[0].text) ||
              "";
            if (reply) break;
          } else {
            lastError =
              (data.error && data.error.message) || "Error Gemini " + modelId;
          }
        }
      }
    }

    if (!reply) {
      return res.status(500).json({
        error:
          lastError ||
          "Sin respuesta IA. Configura OPENROUTER_API_KEY o una GEMINI_API_KEY con cuota.",
      });
    }

    const currentModel = String(model || agentName || "").toLowerCase();
    const lowerMsg = cleanMessage.toLowerCase();

    if (
      currentModel.includes("image") ||
      currentModel.includes("diseñador") ||
      lowerMsg.includes("foto") ||
      lowerMsg.includes("imagen") ||
      lowerMsg.includes("genera")
    ) {
      reply +=
        "\n\n![Imagen Generada](https://image.pollinations.ai/prompt/" +
        encodeURIComponent(cleanMessage) +
        ")";
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Error en chat.js:", err);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
}
