import { test } from "node:test";
import assert from "node:assert/strict";
import { appEnv } from "./env.ts";

test("APP_ENV names where the app runs, and a build with none counts as live", () => {
  const before = { app: process.env.APP_ENV, node: process.env.NODE_ENV };
  const env = process.env as Record<string, string | undefined>;
  try {
    env.APP_ENV = "preview";
    assert.equal(appEnv(), "preview");
    delete env.APP_ENV;
    env.NODE_ENV = "production";
    assert.equal(appEnv(), "production");
    env.NODE_ENV = "development";
    assert.equal(appEnv(), "development");
    env.APP_ENV = "staging";
    assert.equal(appEnv(), "development");
  } finally {
    env.APP_ENV = before.app;
    if (before.app === undefined) delete env.APP_ENV;
    env.NODE_ENV = before.node;
    if (before.node === undefined) delete env.NODE_ENV;
  }
});
