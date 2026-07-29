export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, model } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Falta el mensaje.' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Falta configurar la clave de la API en Vercel.' });
        }

        // Usamos exactamente el modelo y formato que tenías funcionando al principio
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Actúa como el agente ${model || 'asistente'}. Responde de forma clara y concisa a esto: ${message}` }] }]
            })
        });

        const data = await geminiRes.json();

        if (!geminiRes.ok) {
            const errorMsg = data.error?.message || 'Error desconocido en la API de Google';
            return res.status(500).json({ error: errorMsg });
        }

        let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se obtuvo respuesta.';

        // Comprobamos si se debe adjuntar imagen (si es el diseñador o si el mensaje pide una foto)
        const currentModel = (model || '').toLowerCase();
        const lowerMsg = message.toLowerCase();
        
        if (currentModel.includes('diseñador') || lowerMsg.includes('foto') || lowerMsg.includes('imagen') || lowerMsg.includes('genera')) {
            const promptClean = encodeURIComponent(message);
            const imageUrl = `https://image.pollinations.ai/prompt/${promptClean}`;
            reply += `\n\n![Imagen Generada](${imageUrl})`;
        }

        return res.status(200).json({ reply });

    } catch (err) {
        console.error("Error en chat.js:", err);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}