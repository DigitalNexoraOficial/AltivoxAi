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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Falta configurar GEMINI_API_KEY." });
    }

    const agentName = agent || model || mode || "asistente";
    const systemPrompt =
      `Eres ${agentName} del ecosistema AltivoxAi. ` +
      "Responde en el idioma del usuario, de forma clara, profesional y concisa. " +
      "Si detectas interés comercial, pide nombre y email de forma natural.";

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nUsuario: ${message}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      const errorMsg = (data.error && data.error.message) || "Error en la API de Google";
      return res.status(500).json({ error: errorMsg });
    }

    let reply =
      (data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0] &&
        data.candidates[0].content.parts[0].text) ||
      "No se obtuvo respuesta.";

    const currentModel = String(model || agentName || "").toLowerCase();
    const lowerMsg = String(message).toLowerCase();

    if (
      currentModel.includes("image") ||
      currentModel.includes("diseñador") ||
      currentModel.includes("diseñador") ||
      lowerMsg.includes("foto") ||
      lowerMsg.includes("imagen") ||
      lowerMsg.includes("genera")
    ) {
      const imageUrl =
        "https://image.pollinations.ai/prompt/" + encodeURIComponent(message);
      reply += `\n\n![Imagen Generada](${imageUrl})`;
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Error en chat.js:", err);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
}
