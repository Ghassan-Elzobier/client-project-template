/**
 * Where this copy of the app runs: "production" (the live site), "preview" (the
 * staging site and each pull request's preview, on their own Worker and data) or
 * "development" (`next dev`). Cloudflare sets APP_ENV from wrangler.jsonc; with no
 * value, a production build counts as live, the safe guess.
 */
export function appEnv(): "production" | "preview" | "development" {
  const value = process.env.APP_ENV;
  if (value === "production" || value === "preview" || value === "development") return value;
  return process.env.NODE_ENV === "production" ? "production" : "development";
}
