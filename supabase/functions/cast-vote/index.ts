import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create client with user's token
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    const { problematicas } = await req.json();

    if (
      !Array.isArray(problematicas) ||
      problematicas.length === 0 ||
      problematicas.length > 3
    ) {
      return new Response(
        JSON.stringify({ error: "Selecciona entre 1 y 3 problemáticas" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const valid = [
      "mantenimiento",
      "seguridad",
      "equipo_obsoleto",
      "oferta_academica",
      "transporte",
    ];
    if (!problematicas.every((p: string) => valid.includes(p))) {
      return new Response(
        JSON.stringify({ error: "Problemática inválida" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Use service role for atomic operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Check if user already voted
    const { data: padron } = await supabaseAdmin
      .from("padron_electoral")
      .select("participo")
      .eq("user_id", userId)
      .single();

    if (padron?.participo) {
      return new Response(
        JSON.stringify({ error: "Ya has participado en esta consulta" }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. Mark participation (IDENTITY side - no vote info)
    if (padron) {
      await supabaseAdmin
        .from("padron_electoral")
        .update({
          participo: true,
          fecha_participacion: new Date().toISOString(),
        })
        .eq("user_id", userId);
    } else {
      // Get numero_control from user metadata
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      const numeroControl = userData?.user?.user_metadata?.numero_control || "unknown";
      
      await supabaseAdmin.from("padron_electoral").insert({
        user_id: userId,
        numero_control: numeroControl,
        participo: true,
        fecha_participacion: new Date().toISOString(),
      });
    }

    // 3. Increment vote counts ANONYMOUSLY (RESULTS side - no identity)
    // This is the blind token concept: after this point, there's no way
    // to link which user voted for which option
    for (const prob of problematicas) {
      await supabaseAdmin.rpc("increment_vote", { prob_id: prob });
    }

    // 4. Generate anonymous folio
    const folio = crypto.randomUUID();
    await supabaseAdmin
      .from("folios_participacion")
      .insert({ folio });

    return new Response(
      JSON.stringify({ folio }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Vote error:", err);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
