import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const action = body.action || "chat";

    if (action === "chat") {
      return await handleChat(body);
    }

    if (action === "analyze") {
      return await handleAnalyze(body);
    }

    return json({ error: "Acción no válida" }, 400);
  } catch (err) {
    console.error(err);
    return json({ error: err?.message || "Error interno" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleChat(body: Record<string, unknown>) {
  const message = String(body.message || "").trim();
  const model = String(body.model || body.agent || "asistente");
  if (!message) return json({ error: "Falta el mensaje." }, 400);

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return json({ error: "Falta GEMINI_API_KEY en secrets." }, 500);

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
                text:
                  `Actúa como el agente ${model} de AltivoxAi. Responde claro y conciso.\n\nUsuario: ${message}`,
              },
            ],
          },
        ],
      }),
    },
  );

  const data = await geminiRes.json();
  if (!geminiRes.ok) {
    return json({ error: data?.error?.message || "Error Gemini" }, 500);
  }

  let reply =
    data?.candidates?.[0]?.content?.parts?.[0]?.text || "No se obtuvo respuesta.";

  const lower = message.toLowerCase();
  if (
    model.toLowerCase().includes("image") ||
    lower.includes("imagen") ||
    lower.includes("foto") ||
    lower.includes("genera")
  ) {
    reply += `\n\n![Imagen Generada](https://image.pollinations.ai/prompt/${encodeURIComponent(message)})`;
  }

  return json({ reply });
}

async function handleAnalyze(body: Record<string, unknown>) {
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const userMsgs = messages.filter((m: any) => m?.role === "user" && String(m.content || "").trim());

  // Conversación vacía → no guardar / borrar
  if (!userMsgs.length) {
    return json({ ok: true, action: "discard", reason: "empty" });
  }

  const transcript = messages
    .map((m: any) => `${m.role === "user" ? "Usuario" : "Asistente"}: ${m.content}`)
    .join("\n");

  const emailMatch = transcript.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const nameHint = extractName(transcript);
  const score = scoreLead(transcript);
  const isLead = score >= 25 || Boolean(emailMatch);

  if (!isLead) {
    return json({ ok: true, action: "discard", reason: "not_lead", score });
  }

  const clasificacion = score >= 60 ? "caliente" : score >= 30 ? "templado" : "frio";
  const prioridad = clasificacion === "caliente" ? "alta" : clasificacion === "templado" ? "media" : "baja";

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, serviceKey);

  const payload = {
    nombre: nameHint || "Lead Chat",
    email: emailMatch ? emailMatch[0] : `chat+${Date.now()}@pending.altivoxai`,
    empresa: "",
    mensaje: transcript.slice(0, 8000),
    tipo_interes: String(body.agent || "Chat JARVIS"),
    fuente: "chat",
    score,
    clasificacion,
    prioridad,
    estado: "nuevo",
    auto_respuesta: buildReply(clasificacion, nameHint),
    ultimo_contacto: new Date().toISOString(),
  };

  const { data, error } = await sb.from("leads").insert([payload]).select().single();
  if (error) return json({ error: error.message }, 500);

  return json({ ok: true, action: "saved", lead: data });
}

function scoreLead(text: string) {
  const t = text.toLowerCase();
  let score = 0;
  if (t.includes("urgente")) score += 35;
  if (t.includes("presupuesto") || t.includes("precio") || t.includes("cotiz")) score += 30;
  if (t.includes("contratar") || t.includes("quiero") || t.includes("necesito")) score += 20;
  if (t.includes("automat")) score += 20;
  if (t.includes("ia") || t.includes("inteligencia")) score += 15;
  if (t.includes("ecommerce") || t.includes("tienda") || t.includes("web")) score += 15;
  if (t.includes("proyecto")) score += 15;
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text)) score += 25;
  if (t.length > 120) score += 10;
  return score;
}

function extractName(text: string) {
  const m =
    text.match(/(?:me llamo|soy|nombre[:\s]+)([A-Za-zÁÉÍÓÚáéíóúñÑ ]{2,40})/i) ||
    text.match(/my name is\s+([A-Za-z ]{2,40})/i);
  return m ? m[1].trim().slice(0, 60) : "";
}

function buildReply(clasificacion: string, nombre: string) {
  const n = nombre || "hola";
  if (clasificacion === "caliente") {
    return `Hola ${n}, gracias por contactar con AltivoxAI. Hemos priorizado tu solicitud.`;
  }
  if (clasificacion === "templado") {
    return `Hola ${n}, estamos revisando tu caso y te enviaremos una propuesta pronto.`;
  }
  return `Hola ${n}, hemos recibido tu consulta desde el chat y te contactaremos.`;
}
