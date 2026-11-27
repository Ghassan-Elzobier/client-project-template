import { test } from "node:test";
import assert from "node:assert/strict";
import { contentSecurityPolicy, newNonce } from "./csp.ts";

const directive = (policy: string, name: string) => policy.split("; ").find((d) => d.startsWith(`${name} `)) ?? "";

test("scripts run only with the request's nonce, and eval only in development", () => {
  const live = contentSecurityPolicy("abc", { dev: false });
  assert.equal(directive(live, "script-src"), "script-src 'self' 'nonce-abc' 'strict-dynamic'");
  assert.match(contentSecurityPolicy("abc", { dev: true }), /'unsafe-eval'/);
});

test("the browser may talk to the app and to Supabase, over https and websockets", () => {
  const policy = contentSecurityPolicy("n", { dev: false, supabaseUrl: "https://example-ref.supabase.co/" });
  assert.equal(
    directive(policy, "connect-src"),
    "connect-src 'self' https://example-ref.supabase.co wss://example-ref.supabase.co",
  );
  const local = contentSecurityPolicy("n", { dev: false, supabaseUrl: "http://127.0.0.1:56421" });
  assert.equal(directive(local, "connect-src"), "connect-src 'self' http://127.0.0.1:56421 ws://127.0.0.1:56421");
});

test("a missing or broken Supabase address leaves the app's own origin only", () => {
  assert.equal(directive(contentSecurityPolicy("n", { dev: false }), "connect-src"), "connect-src 'self'");
  assert.equal(
    directive(contentSecurityPolicy("n", { dev: false, supabaseUrl: "not a url" }), "connect-src"),
    "connect-src 'self'",
  );
});

test("no framing, plugins or base tags, and forms post back to the app", () => {
  const policy = contentSecurityPolicy("n", { dev: false });
  for (const d of ["frame-ancestors 'none'", "object-src 'none'", "base-uri 'none'", "form-action 'self'"])
    assert.ok(policy.includes(d), d);
});

test("every request gets a different nonce", () => {
  assert.notEqual(newNonce(), newNonce());
  assert.match(newNonce(), /^[A-Za-z0-9+/=]{20,}$/);
});
