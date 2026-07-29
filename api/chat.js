export default async function handler(req, res) {
  // Permitir solo peticiones POST
  if (req.method !== 'POST') {
    return res.status(405.0).json({ error: 'Método no permitido' });
  }

  try {
    const { messages } = req.body;

    // Realiza la petición a la API de IA usando la clave secreta guardada en Vercel
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.API_KEY_IA}` // Lee la clave segura de Vercel
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // O el modelo que prefieras usar
        messages: messages,
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json();
    return res.status(200.0).json(data);

  } catch (error) {
    console.error("Error en la Serverless Function:", error);
    return res.status(500.0).json({ error: 'Error interno del servidor' });
  }
}
