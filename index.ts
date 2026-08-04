import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const limite = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("*")
      .lt("ultimo_contacto", limite)
      .in("estado", ["nuevo", "en_proceso", "pendiente"]);

    if (leadsError) throw leadsError;

    if (!leads || leads.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0 }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    for (const lead of leads) {
      const followupMessage =
        `Hola ${lead.nombre || ""}, seguimos disponibles para ayudarte con tu proyecto. ` +
        `Si quieres, te enviamos propuesta y próximos pasos hoy mismo.`;

      await supabase.from("lead_followups").insert([
        {
          lead_id: lead.id,
          canal: lead.canal_preferido || "email",
          mensaje: followupMessage,
          estado: "pendiente_envio"
        }
      ]);

      await supabase
        .from("leads")
        .update({
          estado: "seguimiento_programado",
          ultimo_contacto: new Date().toISOString()
        })
        .eq("id", lead.id);
    }

    return new Response(JSON.stringify({ ok: true, processed: leads.length }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
