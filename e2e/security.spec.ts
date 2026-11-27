import { expect, test } from "@playwright/test";

// The proxy (src/proxy.ts) runs on the Worker build: OpenNext calls its Node.js
// middleware support experimental, so these checks fail if it ever stops
// running there. They also hold the security policy and the sign-in gate.

test("every page carries the security policy, with a fresh nonce its scripts use", async ({ page }) => {
  const first = await page.goto("/");
  const policy = first?.headers()["content-security-policy"] ?? "";
  expect(policy).toContain("default-src 'self'");
  expect(policy).toContain("frame-ancestors 'none'");
  const nonce = /'nonce-([^']+)'/.exec(policy)?.[1];
  expect(nonce, "the policy has a nonce").toBeTruthy();

  // Next.js puts the request's nonce on the scripts it renders.
  const scripts = await page.locator("script").evaluateAll((els) => els.map((el) => (el as HTMLScriptElement).nonce));
  expect(scripts.length).toBeGreaterThan(0);
  expect(scripts.every((n) => n === nonce)).toBe(true);

  const second = await page.goto("/");
  expect(second?.headers()["content-security-policy"]).not.toBe(policy);
});

test("the page runs with no policy violation in the console", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (/Content Security Policy|Refused to/i.test(message.text())) violations.push(message.text());
  });
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  expect(violations).toEqual([]);
});

test("the admin area sends a signed-out visitor to sign in, and back afterwards", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login\?next=%2Fadmin$/);
  await expect(page.getByRole("heading", { level: 1, name: "Sign in" })).toBeVisible();
});

test("the deploy check answers without revealing anything", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  const body = await response.json();
  expect(body.ok).toBe(true);
  expect(Object.keys(body).sort()).toEqual(["database", "ok"]);
});

test("the usual headers are set, and nothing says what the site runs on", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-powered-by"]).toBeUndefined();
});
