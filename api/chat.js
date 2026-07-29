export default async function handler(req, res) {
    // Permitir solicitudes CORS si es necesario
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { message, model } = req.body;

    try {
        let reply = "";

        // Usamos Google Gemini para todos los agentes de forma gratuita y 24/7
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Actúa como un asistente técnico experto. Responde breve y claramente a lo siguiente: ${message}` }] }]
            })
        });

        const data = await geminiRes.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }

        if (data.candidates && data.candidates[0].content) {
            reply = data.candidates[0].content.parts[0].text;
        } else {
            reply = "No he podido procesar una respuesta en este momento.";
        }

        return res.status(200).json({ reply });

    } catch (error) {
        console.error("Error en la API:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
