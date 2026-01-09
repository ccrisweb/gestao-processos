import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  // Clear corrupted session storage on mount
  useEffect(() => {
    try {
      // Remove corrupted Supabase cache entries
      const keysToCheck = Object.keys(localStorage);
      for (const key of keysToCheck) {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes("supabase") ||
          lowerKey.includes("sb-") ||
          lowerKey.includes("token")
        ) {
          const value = localStorage.getItem(key);
          // Remove if value is corrupted (undefined, null as strings, or empty)
          if (
            !value ||
            value === "undefined" ||
            value === "null" ||
            value === ""
          ) {
            localStorage.removeItem(key);
            console.log("[Auth] Removed corrupted cache:", key);
          }
        }
      }
    } catch (e) {
      console.warn("[Auth] Cache cleanup error:", e);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    // Check active sessions and sets the user
    const initAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error("Auth initialization error:", error.message);
          // If the error indicates a refresh token problem, clear local session and sign out
          try {
            if (
              error.message &&
              error.message.toLowerCase().includes("refresh")
            ) {
              try {
                await supabase.auth.signOut();
              } catch (e) {
                /* ignore */
              }
              try {
                for (const key of Object.keys(localStorage)) {
                  const lk = key.toLowerCase();
                  if (
                    lk.includes("supabase") ||
                    lk.includes("auth") ||
                    lk.includes("token")
                  ) {
                    try {
                      localStorage.removeItem(key);
                    } catch (e) {}
                  }
                }
              } catch (e) {}
            }
          } catch (e) {
            /* ignore */
          }
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) await fetchRole(session.user.id);
        }
      } catch (error) {
        console.error("Auth initialization error:", error.message);
        // If an unexpected refresh-related error occurs here, sign out to clear state
        try {
          if (
            error &&
            error.message &&
            error.message.toLowerCase().includes("refresh")
          ) {
            try {
              await supabase.auth.signOut();
            } catch (e) {
              /* ignore */
            }
            try {
              for (const key of Object.keys(localStorage)) {
                const lk = key.toLowerCase();
                if (
                  lk.includes("supabase") ||
                  lk.includes("auth") ||
                  lk.includes("token")
                ) {
                  try {
                    localStorage.removeItem(key);
                  } catch (e) {}
                }
              }
            } catch (e) {}
          }
        } catch (e) {}
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Failsafe timeout: unblock UI after 3 seconds even if no response
    const timer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 3000);

    // Listen for changes on auth state (logged in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchRole(session.user.id);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(timer);
      controller.abort();
      subscription?.unsubscribe();
    };
  }, []);

  const fetchRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (data) setRole(data.role);
    } catch (error) {
      console.error("Error fetching role:", error);
    }
  };

  const value = {
    user,
    role,
    session,
    loading,
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signUp: (data) => supabase.auth.signUp(data),
    signOut: () => supabase.auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
