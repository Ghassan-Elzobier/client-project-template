import { type NextRequest } from "next/server";
import { contentSecurityPolicy, newNonce } from "@/lib/security/csp";
import { supabaseEnv } from "@/lib/supabase/env";
import { updateSession } from "@/lib/supabase/session";

const CSP = "Content-Security-Policy";

// Runs before every page and route: the security policy and the sign-in session.
// On Cloudflare it runs as OpenNext's Node.js middleware, which OpenNext calls
// experimental, so e2e/security.spec.ts runs on the Worker build and fails if it
// ever stops running there.
export async function proxy(request: NextRequest) {
  // The nonce is new for every request. It goes on the request, where Next.js
  // reads it and puts it on the scripts it renders, and on the response, where
  // the browser holds the page to it. Whatever policy a client sent is replaced.
  const policy = contentSecurityPolicy(newNonce(), {
    dev: process.env.NODE_ENV === "development",
    supabaseUrl: supabaseEnv()?.url,
  });
  request.headers.set(CSP, policy);
  const response = await updateSession(request);
  response.headers.set(CSP, policy);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|manifest.webmanifest).*)"],
};
