"use server";

import { safeNext } from "@/lib/auth/safe-next";
import { siteOrigin } from "@/lib/site";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";

export type LoginState = { sent?: string; error?: string };

/** Emails a sign-in link to an invited account. Nobody signs themselves up. */
export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!supabaseConfigured()) return { error: "Sign-in is not set up yet." };

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };

  const next = safeNext(formData.get("next"));
  const callback = new URL("/auth/callback", await siteOrigin());
  if (next !== "/") callback.searchParams.set("next", next);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    // Only invited accounts get a link (sign-ups are off in supabase/config.toml).
    options: { shouldCreateUser: false, emailRedirectTo: callback.toString() },
  });

  // The same answer whether or not the account exists, so the form never reveals
  // who has access. Rate limits are the one error worth showing.
  if (error && error.status === 429) return { error: "Too many sign-in emails. Wait a minute and try again." };
  if (error && error.status !== 400 && error.status !== 422) console.error("signInWithOtp failed", error.message);
  return { sent: email };
}
