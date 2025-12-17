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
    const { user_id, device_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "Missing user_id" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    /* 1️⃣ Fetch device limit */
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("device_limit")
      .eq("id", user_id)
      .single();

    const limit = profile?.device_limit ?? 3;

    /* 2️⃣ Fetch devices (oldest first) */
    const { data: devices } = await supabaseAdmin
      .from("user_devices")
      .select("id, device_id")
      .eq("user_id", user_id)
      .order("last_seen_at", { ascending: true });

    if (!devices || devices.length <= limit) {
      return new Response(
        JSON.stringify({ ok: true, enforced: false }),
        { headers: corsHeaders }
      );
    }

    /* 3️⃣ Remove excess devices */
    const excess = devices.length - limit;
    const toRemove = devices.slice(0, excess);
    const removedDeviceIds = toRemove.map(d => d.device_id);

    await supabaseAdmin
      .from("user_devices")
      .delete()
      .in(
        "id",
        toRemove.map((d) => d.id)
      );

    /* 4️⃣ Tell client to log out (only when we actually enforced) */

    return new Response(
      JSON.stringify({
        enforced: true,
        evicted_devices: removedDeviceIds,
      }),
      { headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: corsHeaders }
    );
  }
});
