export default async function handler(req, res) {
    // 1. Configuramos los permisos CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

    const { message, model } = req.body;

    try {
        // 2. Usamos el modelo gemini-1.5-pro que está 100% soportado
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Actúa como ${model || 'asistente'}. Responde a lo siguiente de forma clara: ${message}` }] }]
            })
        });

        const data = await geminiRes.json();
        
        // 3. Capturamos si Gemini devuelve un error de clave o modelo
        if (data.error) {
            throw new Error(data.error.message);
        }

        // 4. Extraemos el texto de forma segura sin romper el servidor
        let reply = "El agente procesó la solicitud pero no devolvió contenido.";
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            reply = data.candidates[0].content.parts[0].text;
        }

        return res.status(200).json({ reply });

    } catch (error) {
        console.error("Error en el servidor:", error.message);
        // TRUCO: Devolvemos status 200 con el mensaje de error para que lo leas directamente en el chat de tu web y no de Error 500
        return res.status(200).json({ reply: `// Error de sistema: ${error.message}` });
    }
}