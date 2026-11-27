// The Content-Security-Policy every page is served with: a second lock, behind
// React's escaping. Client apps show text people type in, and often text
// imported from the client's own files; if a slip ever let a script into a page,
// this is what stops the browser running it.
//
// Scripts are held to a nonce made fresh for each request (src/proxy.ts), with
// 'strict-dynamic', so only the app's own scripts and what they load can run:
// the policy OWASP recommends, set up the way Next.js documents
// (node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md). A
// nonce needs every page rendered per request, which is why the root layout
// waits for the request (src/app/layout.tsx).
//
// The browser talks to the app and to Supabase, nothing else. An analytics tag,
// a font service or a map needs the client's agreement in PROJECT.md ("Data and
// privacy") before it is added here; e2e/security.spec.ts shows the policy.
//
// Styles allow 'unsafe-inline' for style={} values known only at run time. A
// style can't run code.

/** A value no one can guess, new for every request. */
export function newNonce(): string {
  return btoa(crypto.randomUUID());
}

/** The origin of a URL, or null when it is not one. */
function originOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/**
 * The policy for one response. `supabaseUrl` lets the browser reach Supabase
 * (sign-in, and live updates over a websocket). `dev` adds 'unsafe-eval', which
 * React needs under `next dev`, and never otherwise.
 */
export function contentSecurityPolicy(nonce: string, options: { dev: boolean; supabaseUrl?: string }): string {
  const connect = ["'self'"];
  const supabase = originOf(options.supabaseUrl);
  if (supabase) connect.push(supabase, supabase.replace(/^http/, "ws"));
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${options.dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src ${connect.join(" ")}`,
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}
