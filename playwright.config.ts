import { defineConfig, devices } from "@playwright/test";
import { BASE_URL, FIXED_NOW, PORT } from "./e2e/env";

// End-to-end, layout, accessibility and security checks against the Worker
// build (`npm run test:e2e`, which builds it first: scripts/e2e.sh). Phones
// first: every page must hold at 360 px and 412 px, and on a desktop, unless
// PROJECT.md names other devices.
//
// E2E_CHROMIUM_PATH points at a Chromium already on the machine, for a cloud
// session that cannot download the build this Playwright version expects.

const phone = { ...devices["Pixel 7"], deviceScaleFactor: 1 };
const launchOptions = process.env.E2E_CHROMIUM_PATH ? { executablePath: process.env.E2E_CHROMIUM_PATH } : {};

export default defineConfig({
  testDir: "e2e",
  snapshotPathTemplate: "e2e/__screenshots__/{testFileName}/{arg}-{projectName}{ext}",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  expect: {
    toHaveScreenshot: { animations: "disabled", caret: "hide", scale: "css", maxDiffPixels: 0 },
  },
  use: {
    baseURL: BASE_URL,
    locale: "en-GB",
    timezoneId: "Europe/London",
    trace: "retain-on-failure",
    launchOptions,
  },
  projects: [
    { name: "phone", use: { ...phone, launchOptions } },
    { name: "small-phone", use: { ...phone, viewport: { width: 360, height: 780 }, launchOptions } },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 }, launchOptions },
    },
  ],
  webServer: {
    // The preview environment's Worker (wrangler.jsonc), on the clock the suite pins.
    command: `npx opennextjs-cloudflare preview --env preview --ip 127.0.0.1 --port ${PORT} --var APP_FIXED_NOW:${FIXED_NOW}`,
    url: `${BASE_URL}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { WRANGLER_SEND_METRICS: "false" },
  },
});
