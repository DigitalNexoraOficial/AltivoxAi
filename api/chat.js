export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

    const { message, model } = req.body;

    try {
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Actúa como ${model || 'asistente'}. Responde de forma concisa: ${message}` }] }]
            })
        });

        const data = await geminiRes.json();
        
        if (data.error) throw new Error(data.error.message);

        let reply = "El agente procesó la solicitud pero no devolvió contenido.";
        if (data.candidates && data.candidates[0]?.content?.parts) {
            reply = data.candidates[0].content.parts[0].text;
        }

        return res.status(200).json({ reply });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}