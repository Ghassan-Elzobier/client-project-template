// How OpenNext turns the Next.js build into a Cloudflare Worker. No incremental
// cache: every page renders per request (the Content-Security-Policy's nonce
// needs that), so there is nothing to keep in R2 or KV. A project that wants
// cached pages adds a cache here and drops the nonce for a static policy.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({});
