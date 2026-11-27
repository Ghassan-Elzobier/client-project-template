// Where the end-to-end suite finds the app: the Worker build, served by Wrangler
// on workerd, the runtime Cloudflare uses (scripts/e2e.sh, playwright.config.ts).
export const PORT = Number(process.env.E2E_PORT ?? 3100);
export const BASE_URL = `http://127.0.0.1:${PORT}`;

/** The pinned clock the Worker runs on in the suite (src/lib/dates/clock.ts). */
export const FIXED_NOW = process.env.APP_FIXED_NOW ?? "2026-11-16T09:30:00Z";

/** Every page anyone can open without signing in, with its main heading. */
export const PUBLIC_PAGES = [
  { path: "/", heading: /./ },
  { path: "/login", heading: /Sign in/ },
  { path: "/design", heading: /Design/ },
];
