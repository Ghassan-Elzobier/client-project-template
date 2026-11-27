import { test } from "node:test";
import assert from "node:assert/strict";
import { needsSignIn } from "./paths.ts";

test("the admin area needs a sign-in, and nothing else does", () => {
  assert.equal(needsSignIn("/admin"), true);
  assert.equal(needsSignIn("/admin/entries/12"), true);
  assert.equal(needsSignIn("/"), false);
  assert.equal(needsSignIn("/login"), false);
  assert.equal(needsSignIn("/administer"), false);
});
