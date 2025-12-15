import { useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { getDeviceId } from "../utils/getDeviceId";
import { getDeviceInfo } from "../utils/deviceInfo";

export default function DeviceEnforcer({ children }) {
  const { user, loading } = useAuth();
  const ranRef = useRef(false);

  const registerAndEnforce = async (userId) => {
    const device_id = getDeviceId();
    const { device_name, user_agent } = getDeviceInfo();

    // 1️⃣ REGISTER FIRST (idempotent)
    await supabase.from("user_devices").upsert(
      {
        user_id: userId,
        device_id,
        device_name,
        user_agent,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "user_id,device_id" }
    );

    // 2️⃣ FETCH LIMIT
    const { data: profile } = await supabase
      .from("profiles")
      .select("device_limit")
      .eq("id", userId)
      .single();

    const limit = profile?.device_limit ?? 3;

    // 3️⃣ FETCH DEVICES (oldest first)
    const { data: devices } = await supabase
      .from("user_devices")
      .select("id, device_id, last_seen_at")
      .eq("user_id", userId)
      .order("last_seen_at", { ascending: true });

    if (!devices || devices.length <= limit) return;

    const excess = devices.length - limit;
    const toRemove = devices.slice(0, excess);

    const removedCurrent = toRemove.some((d) => d.device_id === device_id);

    await supabase
      .from("user_devices")
      .delete()
      .in(
        "id",
        toRemove.map((d) => d.id)
      );

    // 4️⃣ LOG OUT ONLY IF CURRENT DEVICE WAS EVICTED
    if (removedCurrent) {
      localStorage.setItem(
        "forced_logout_reason",
        "You were logged out because your device limit was exceeded."
      );
      await supabase.auth.signOut();
    }
  };

  useEffect(() => {
    if (loading || !user) return;
    if (ranRef.current) return;

    ranRef.current = true;

    registerAndEnforce(user.id).catch((err) =>
      console.error("Device enforcement failed:", err)
    );
  }, [loading, user?.id]);

  return children;
}
