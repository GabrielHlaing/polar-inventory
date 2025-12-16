import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "Missing user_id" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 🔐 ADMIN CLIENT (service role)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    /* 1️⃣ Fetch settings (jsonb) */
const { data: profile, error: profileError } = await supabaseAdmin
  .from("profiles")
  .select("settings")
  .eq("user_id", user_id)
  .maybeSingle();

if (profileError) {
  console.warn("Profile fetch failed:", profileError.message);
}

/* 2️⃣ Extract logo_path from settings */
const logoPath = profile?.settings?.logo_path;
console.log("DELETE PATH:", logoPath);
console.log("BUCKET:", "shop-logos");


/* 3️⃣ Delete logo from storage if exists */
if (logoPath) {
  const { error: storageError } = await supabaseAdmin.storage
    .from("shop-logos")
    .remove([logoPath]);

  if (storageError) {
    console.warn("Logo delete failed:", storageError.message);
  }
}

    /* Delete profile row */
    await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("user_id", user_id);

    /* Delete auth user */
    const { error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(user_id);

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: corsHeaders }
    );
  }
});
