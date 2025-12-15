import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "./AuthContext";

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const { user, loading: authLoading } = useAuth(); // 🔑 single source of truth
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      // ⛔ auth not ready yet
      if (authLoading) return;

      // ✅ auth ready but no user
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (cancelled) return;
        if (error) throw error;

        setProfile(data);
      } catch (err) {
        console.error("Profile fetch failed:", err);
        setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id]); // 👈 IMPORTANT

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,

        isAdmin: profile?.is_admin === true,
        isPremium: profile?.tier === "premium",
        premiumExpiresAt: profile?.tier_expires_at
          ? new Date(profile.tier_expires_at)
          : null,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProfile = () => useContext(ProfileContext);
