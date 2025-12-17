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

  const signup = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, email },
      },
    });
    if (error) throw error;

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
