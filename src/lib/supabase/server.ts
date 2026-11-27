import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "./env";

export function supabaseConfigured(): boolean {
  return supabaseEnv() !== null;
}

/** A Supabase client acting for whoever sent the request: signed in, or anonymous. */
export async function createClient() {
  const env = supabaseEnv();
  if (!env) throw new Error("Supabase is not configured: see docs/SETUP.md");
  const cookieStore = await cookies();
  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Called from a Server Component, where cookies are read-only. The
          // proxy (src/proxy.ts) refreshes the session, so this is safe to ignore.
        }
      },
    },
  });
}
