import { useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { getDeviceId } from "../utils/getDeviceId";
import { getDeviceInfo } from "../utils/deviceInfo";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function DeviceEnforcer({ children }) {
  const { user, loading } = useAuth();
  const ranRef = useRef(false);
  const deviceIdRef = useRef(getDeviceId());

  const navigate = useNavigate();

  const updateLastSeen = async (userId) => {
    await supabase
      .from("user_devices")
      .update({
        last_seen_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("device_id", deviceIdRef.current);
  };

  const registerAndEnforce = async (userId) => {
    const device_id = deviceIdRef.current;
    const { device_name, user_agent } = getDeviceInfo();

    // 1️⃣ Register / upsert
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

    // 2️⃣ Enforce limit (server-side)
    const res = await supabase.functions.invoke("enforce-device-limit", {
      body: { user_id: userId },
    });

    if (res.data?.forceLogout) {
      await supabase.auth.signOut(); // wipe local tokens
      toast.warn("Please log in again.");

      navigate("/login", { replace: true }); // hard redirect → must log in again
      return; // stop further renders
    }
  };

  useEffect(() => {
    if (loading || !user) return;
    if (ranRef.current) return;

    ranRef.current = true;

    updateLastSeen(user.id).catch(console.error);

    registerAndEnforce(user.id).catch(console.error);
  }, [loading, user?.id]);

  return children;
}
