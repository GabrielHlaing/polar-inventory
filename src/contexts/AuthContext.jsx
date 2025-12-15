import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { getDeviceId } from "../utils/getDeviceId";
import { getDeviceInfo } from "../utils/deviceInfo";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ----------------------------------------
   * Device enforcement helpers
   * ------------------------------------- */

  const enforceDeviceLimit = async (userId) => {
    try {
      const device_id = getDeviceId();

      const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .select("device_limit")
        .eq("id", userId)
        .single();

      if (profErr) throw profErr;

      const limit = profile?.device_limit ?? 3;

      const { data: devices, error: devErr } = await supabase
        .from("user_devices")
        .select("id, device_id, created_at, last_seen_at")
        .eq("user_id", userId)
        .order("last_seen_at", { ascending: true });

      if (devErr) throw devErr;
      if (!devices || devices.length <= limit) return;

      const excess = devices.length - limit;
      const toRemove = devices.slice(0, excess);

      const removedCurrentDevice = toRemove.some(
        (d) => d.device_id === device_id
      );

      await supabase
        .from("user_devices")
        .delete()
        .in(
          "id",
          toRemove.map((d) => d.id)
        );

      if (removedCurrentDevice) {
        localStorage.setItem(
          "forced_logout_reason",
          "You were logged out because your device limit was exceeded."
        );

        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error("Device limit enforcement failed:", err);
    }
  };

  const registerDevice = async (userId) => {
    try {
      const device_id = getDeviceId();
      const { device_name, user_agent } = getDeviceInfo();

      const { error } = await supabase.from("user_devices").upsert(
        {
          user_id: userId,
          device_id,
          device_name,
          user_agent,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "user_id,device_id" }
      );

      if (error) throw error;

      await enforceDeviceLimit(userId);
    } catch (err) {
      console.error("Device registration failed:", err);
    }
  };

  const checkDeviceStillValid = async (userId) => {
    try {
      const device_id = getDeviceId();

      const { data, error } = await supabase
        .from("user_devices")
        .select("id")
        .eq("user_id", userId)
        .eq("device_id", device_id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        localStorage.setItem(
          "forced_logout_reason",
          "You were logged out because your device limit was exceeded."
        );

        await supabase.auth.signOut();

        return;
      }

      await supabase
        .from("user_devices")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("device_id", device_id);
    } catch (err) {
      console.error("Device validity check failed:", err);
    }
  };

  /* ----------------------------------------
   * Initial boot (ONCE)
   * ------------------------------------- */
  useEffect(() => {
    const init = async () => {
      getDeviceId();

      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);

      if (data.user) {
        await checkDeviceStillValid(data.user.id);
      }

      setLoading(false);
    };

    init();
  }, []);

  /* ----------------------------------------
   * Auth state listener (REGISTER ONCE)
   * ------------------------------------- */
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);

        if (event === "SIGNED_IN" && session?.user) {
          await registerDevice(session.user.id);
          navigate("/", { replace: true });
        }

        if (event === "SIGNED_OUT") {
          setUser(null);
          navigate("/login", { replace: true });
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  /* ----------------------------------------
   * Focus / visibility device check
   * ------------------------------------- */
  useEffect(() => {
    if (!user) return;

    const handleFocus = async () => {
      await checkDeviceStillValid(user.id);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        handleFocus();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user?.id]);

  /* ----------------------------------------
   * Auth API
   * ------------------------------------- */
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signup = async (email, password, name) => {
    const { data, error: signError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, email } },
    });
    if (signError) throw signError;

    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    const { error: profError } = await supabase
      .from("profiles")
      .update({
        name,
        email,
        tier: "premium",
        tier_expires_at: expires.toISOString(),
      })
      .eq("id", data.user.id);

    if (profError) throw profError;

    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
