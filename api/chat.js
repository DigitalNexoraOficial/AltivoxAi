export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, model, agent, mode } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "Falta el mensaje." });
    }

    const agentName = agent || model || mode || "asistente";
    const systemPrompt =
      `Eres ${agentName} del ecosistema AltivoxAi. ` +
      "Responde en el idioma del usuario, de forma clara, profesional y concisa. " +
      "Si detectas interés comercial, pide nombre y email de forma natural.";

    let reply = "";
    let lastError = "";

    // 1) OpenRouter (recomendado si Gemini free tier está a 0)
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey) {
      try {
        const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + openRouterKey,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://www.altivoxai.es",
            "X-Title": "AltivoxAi"
          },
          body: JSON.stringify({
            model: process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message }
            ]
          })
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

    // 2) Gemini directo (solo si OpenRouter no dio respuesta)
    if (!reply) {
      const geminiKey = process.env.GEMINI_API_KEY;
      if (geminiKey) {
        const modelsToTry = [
          process.env.GEMINI_MODEL || "gemini-2.5-flash",
          "gemini-2.5-flash-lite",
          "gemini-flash-latest",
          "gemini-1.5-flash"
        ];

        for (const modelId of modelsToTry) {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemPrompt}\n\nUsuario: ${message}` }] }]
              })
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
              (data.error && data.error.message) ||
              ("Error Gemini " + modelId);
          }
        }
      }
    }

    if (!reply) {
      return res.status(500).json({
        error:
          lastError ||
          "Sin respuesta IA. Configura OPENROUTER_API_KEY o una GEMINI_API_KEY con cuota."
      });
    }

    const currentModel = String(model || agentName || "").toLowerCase();
    const lowerMsg = String(message).toLowerCase();

    if (
      currentModel.includes("image") ||
      currentModel.includes("diseñador") ||
      lowerMsg.includes("foto") ||
      lowerMsg.includes("imagen") ||
      lowerMsg.includes("genera")
    ) {
      reply +=
        "\n\n![Imagen Generada](https://image.pollinations.ai/prompt/" +
        encodeURIComponent(message) +
        ")";
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Error en chat.js:", err);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
}
