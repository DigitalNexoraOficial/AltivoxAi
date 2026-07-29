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

        // Llamada a Gemini respetando el rol del agente actual
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Actúa estrictamente bajo el rol y directrices del agente: ${model || 'asistente'}. Responde de forma adecuada al siguiente mensaje: ${message}` }] }]
            })
        });

        const data = await geminiRes.json();

        if (!geminiRes.ok) {
            const errorMsg = data.error?.message || 'Error desconocido en la API de Google';
            return res.status(500).json({ error: errorMsg });
        }

        let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se obtuvo respuesta.';

        // SOLO si el agente activo es el Diseñador O el mensaje pide explícitamente una imagen, adjuntamos la foto generada
        const currentModel = (model || '').toLowerCase();
        const lowerMsg = message.toLowerCase();
        
        const esDisenador = currentModel.includes('diseñador') || currentModel.includes('visual');
        const pideImagen = lowerMsg.includes('foto') || lowerMsg.includes('imagen') || lowerMsg.includes('genera una');

        if (esDisenador || pideImagen) {
            const promptClean = encodeURIComponent(message);
            const imageUrl = `https://image.pollinations.ai/prompt/${promptClean}`;
            // Se añade la imagen en formato Markdown al final respetando la respuesta del agente
            reply += `\n\n![Imagen Generada](${imageUrl})`;
        }

        return res.status(200).json({ reply });

    } catch (err) {
        console.error("Error en chat.js:", err);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}