import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { needsSignIn } from "@/lib/auth/paths";
import { supabaseEnv } from "./env";

/**
 * Refreshes the Supabase session cookie, and sends signed-out visitors away from
 * the pages that need a sign-in (src/lib/auth/paths.ts). Called by src/proxy.ts only.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });
  const env = supabaseEnv();
  const path = request.nextUrl.pathname;
  if (!env) return needsSignIn(path) ? toLogin(request) : response;

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  // Checks the token's signature rather than asking Supabase on every request,
  // and still refreshes an expired session. What each caller may read or change
  // is decided by the database, on every call.
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub && needsSignIn(path)) return toLogin(request);
  return response;
}

function toLogin(request: NextRequest): NextResponse {
  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}
