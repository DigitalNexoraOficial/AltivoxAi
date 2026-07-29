export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { message, model } = req.body;

    try {
        let reply = "";

        // Enrutamiento según el agente seleccionado en el frontend
        if (model === 'altivox-tech' || model === 'altivox-auditor') {
            // Usamos Groq (Llama 3) para código y auditoría por su velocidad
            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama3-70b-8192',
                    messages: [{ role: 'user', content: message }]
                })
            });
            const data = await groqRes.json();
            reply = data.choices[0].message.content;

        } else {
            // Usamos Google Gemini para investigación, creatividad y general
            const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: message }] }]
                })
            });
            const data = await geminiRes.json();
            reply = data.candidates[0].content.parts[0].text;
        }

        return res.status(200).json({ reply });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error procesando la petición con la IA.' });
    }
}
