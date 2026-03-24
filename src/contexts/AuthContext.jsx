// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { toast } from "react-toastify";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Auth boot & lifecycle
   * SINGLE SOURCE OF TRUTH
   */
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // INITIAL_SESSION fires on reload
      setUser(session?.user ?? null);

      if (event === "SIGNED_OUT") {
        toast.info("You have been logged out.");
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ---------------------------
   * Auth API
   * ------------------------ */

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signup = async (
    email,
    password,
    name,
    role = "owner",
    inviteCode = null,
  ) => {
    if (!email || !password || !name) {
      throw new Error("All fields are required");
    }

    if (role === "staff" && !inviteCode) {
      throw new Error("Invite code required");
    }

    let businessId = null;

    // Pre-check for staff
    if (role === "staff") {
      const { data: business, error } = await supabase
        .from("businesses")
        .select("id")
        .eq("invite_code", inviteCode)
        .single();

      if (error || !business) throw new Error("Invalid invite code");
      businessId = business.id;
    }

    // Create auth user (last step)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, email } },
    });

    if (error) throw error;

    const userId = data.user.id;

    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    if (role === "owner") {
      businessId = userId;

      const { error: bizError } = await supabase.from("businesses").insert({
        id: userId,
        name: null,
        owner_id: userId,
        created_at: new Date().toISOString(),
      });

      if (bizError) throw bizError;
    }

    const { error: profError } = await supabase
      .from("profiles")
      .update({
        name,
        email,
        role,
        business_id: businessId,
        tier: role === "owner" ? "premium" : "free",
        device_limit: role === "owner" ? 3 : 1,
        tier_expires_at: role === "owner" ? expires.toISOString() : null,
      })
      .eq("id", userId);

    if (profError) throw profError;

    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
