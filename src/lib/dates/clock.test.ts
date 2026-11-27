import { test } from "node:test";
import assert from "node:assert/strict";
import { now } from "./clock.ts";

function withEnv(values: Record<string, string | undefined>, fn: () => void) {
  const before = Object.fromEntries(Object.keys(values).map((k) => [k, process.env[k]]));
  for (const [k, v] of Object.entries(values))
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  try {
    fn();
  } finally {
    for (const [k, v] of Object.entries(before))
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
  }
}

test("a test run pins the clock", () => {
  withEnv({ APP_FIXED_NOW: "2026-11-16T09:30:00Z", APP_ENV: "preview" }, () => {
    assert.equal(now().toISOString(), "2026-11-16T09:30:00.000Z");
  });
});

test("the live site ignores a pinned clock, and so does a value that is not a time", () => {
  withEnv({ APP_FIXED_NOW: "2026-11-16T09:30:00Z", APP_ENV: "production" }, () => {
    assert.ok(Math.abs(now().getTime() - Date.now()) < 5_000);
  });
  withEnv({ APP_FIXED_NOW: "soon", APP_ENV: "preview" }, () => {
    assert.ok(Math.abs(now().getTime() - Date.now()) < 5_000);
  });
});
