import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth/safe-next";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";

// Where sign-in links land. Handles the PKCE code (Supabase's default email
// template) and token_hash links (a customised template).
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNext(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const fail = () => NextResponse.redirect(new URL("/login?error=link", url.origin));
  if (!supabaseConfigured() || url.searchParams.get("error")) return fail();

  const supabase = await createClient();
  let ok = false;
  if (code) ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  else if (tokenHash && type) ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;

  return ok ? NextResponse.redirect(new URL(next, url.origin)) : fail();
}
