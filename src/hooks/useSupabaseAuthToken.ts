import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

export function useSupabaseAuthToken(supabase: SupabaseClient | null) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchToken() {
      if (!supabase) {
        setToken(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (error) {
          setError(error.message);
          setToken(null);
          return;
        }
        const jwt = data.session?.access_token ?? null;
        setToken(jwt);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message ?? "Failed to fetch auth token");
        setToken(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchToken();

    const { data: subscription } = supabase?.auth.onAuthStateChange?.(
      async (_event, session) => {
        if (!isMounted) return;
        setToken(session?.access_token ?? null);
      }
    ) ?? { data: null };

    return () => {
      isMounted = false;
      subscription?.subscription?.unsubscribe?.();
    };
  }, [supabase]);

  return { token, loading, error };
}
