import { createClient } from "@supabase/supabase-js";

// Fallback to project credentials if env vars are missing
// These are safe to be public (anon key)
const PROJECT_URL = "https://itkxfqmsgroyxdoalvph.supabase.co";
const PROJECT_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0a3hmcW1zZ3JveXhkb2FsdnBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MzgxMzcsImV4cCI6MjA4MzExNDEzN30.XTkvG9MP-XZzsaH4D9FUbpa91TLOMDKsD3FP-SFLCE0";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || PROJECT_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || PROJECT_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("CRITICAL: Supabase credentials missing!");
}

console.log("[Supabase] Inicializando cliente...");
console.log("[Supabase] URL:", supabaseUrl);

// Custom fetch with optimized timeout - increased to 120 seconds for slow connections
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 seconds for reliability

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    try {
      // If refresh endpoint failed, clear local persisted session to avoid refresh loops
      const lowerUrl = (response.url || "").toLowerCase();
      if (
        (lowerUrl.includes("/token") || lowerUrl.includes("refresh")) &&
        (response.status === 400 || response.status === 401)
      ) {
        console.warn(
          "[Supabase] Refresh token failed (status " +
            response.status +
            "). Clearing local session to avoid loops."
        );
        try {
          // Remove common supabase auth keys from storage
          for (const key of Object.keys(localStorage)) {
            if (
              key.toLowerCase().includes("supabase") ||
              key.toLowerCase().includes("sb-") ||
              key.toLowerCase().includes("auth") ||
              key.toLowerCase().includes("token")
            ) {
              try {
                localStorage.removeItem(key);
              } catch (e) {
                /* ignore */
              }
            }
          }
        } catch (e) {
          /* ignore storage cleanup errors */
        }
      }
    } catch (e) {
      // Non-fatal logging
      console.debug("[Supabase] fetch post-check error:", e);
    }
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      console.error(
        "[Supabase] Request timeout after 120 seconds - connection may be slow"
      );
      throw new Error("Request timeout after 120 seconds - connection issue");
    }
    throw error;
  }
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Disable persistent session to avoid cache corruption
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "implicit", // Use implicit flow for GitHub Pages
    storage: {
      getItem: (key) => {
        try {
          return localStorage.getItem(key);
        } catch (e) {
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          console.warn("[Supabase] Failed to write to localStorage:", e);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn("[Supabase] Failed to remove from localStorage:", e);
        }
      },
    },
  },
  global: {
    headers: {
      "x-client-info": "gestao-processos@1.0.0",
      "Content-Type": "application/json",
      "Cache-Control": "no-store, max-age=0",
    },
    fetch: fetchWithTimeout,
  },
  db: {
    schema: "public",
  },
});

// Verify connection on initialization
console.log("[Supabase] Cliente inicializado com sucesso");
console.log("[Supabase] Verificando conexão...");

// Clear corrupted Supabase cache on app start
const clearSupabaseCache = () => {
  try {
    const keysToRemove = [];
    for (const key of Object.keys(localStorage)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes("supabase") ||
        lowerKey.includes("sb-") ||
        lowerKey.includes("auth-") ||
        lowerKey.includes("token")
      ) {
        keysToRemove.push(key);
      }
    }
    // Remove only invalid/corrupted cache, not current session
    keysToRemove.forEach((key) => {
      try {
        const value = localStorage.getItem(key);
        // Check if value is corrupted (not valid JSON)
        if (value && (value === "undefined" || value === "null")) {
          localStorage.removeItem(key);
          console.log("[Supabase] Removed corrupted cache key:", key);
        }
      } catch (e) {
        // If we can't access it, remove it
        localStorage.removeItem(key);
        console.log("[Supabase] Removed problematic cache key:", key);
      }
    });
  } catch (e) {
    console.warn("[Supabase] Cache cleanup failed:", e);
  }
};

clearSupabaseCache();

// Test basic connectivity
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("complaints")
      .select("id", { count: "exact", head: true })
      .limit(1);

    if (error) {
      console.warn("[Supabase] Conexão: Erro ao testar", error.message);
    } else {
      console.log("[Supabase] Conexão: OK");
    }
  } catch (e) {
    console.warn("[Supabase] Conexão: Falha ao testar", e.message);
  }
};

// Delay test to allow client to fully initialize
setTimeout(testConnection, 1000);
