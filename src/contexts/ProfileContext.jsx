// src/context/ProfileContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      // Session revoked / user deleted / device evicted
      await supabase.auth.signOut();
      setProfile(null);
      setLoading(false);
      return;
    }

    // Auto-demote if premium expired
    if (data?.tier === "premium" && data?.tier_expires_at) {
      const now = new Date();
      const expires = new Date(data.tier_expires_at);

      if (expires < now) {
        // Expired → downgrade to free
        await supabase
          .from("profiles")
          .update({
            tier: "free",
            tier_expires_at: null,
          })
          .eq("id", user.id);

        data.tier = "free";
        data.tier_expires_at = null;
      }
    }

    setProfile(data || null);

    setLoading(false);
  }

  // Handle login / logout
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await loadProfile();
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      init();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function updateExpWarningDays(days) {
    if (!profile) return;

    const newSettings = {
      ...profile.settings,
      exp_warning_days: days,
    };

    await supabase
      .from("profiles")
      .update({ settings: newSettings })
      .eq("id", profile.id);

    setProfile({ ...profile, settings: newSettings });
  }

  async function updateSettings(newSettings) {
    if (!profile) return;

    const updatedSettings = {
      ...profile.settings,
      ...newSettings,
    };

    const { error } = await supabase
      .from("profiles")
      .update({ settings: updatedSettings })
      .eq("id", profile.id);

    if (error) return { error };

    setProfile((prev) => ({ ...prev, settings: updatedSettings }));
    return { data: updatedSettings };
  }

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        reloadProfile: loadProfile,
        updateSettings,
        updateExpWarningDays,

        expWarningDays: profile?.settings?.exp_warning_days ?? 7,

        // Helpers
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
