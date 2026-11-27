---
name: debug
description: Find and fix a bug the way a developer with DevTools would - reproduce it as a failing end-to-end test, stop at the failure and look at the page, its state, console and network, fix the app, and prove it. Use for any bug, a report from the client, or a failing check.
argument-hint: "[the bug, an issue number, or the failing check]"
---

# Debug

Bug: $ARGUMENTS

Never fix what you have not seen fail. Work in this order.

1. **Reproduce it as a test that fails.** In `e2e/`, as a user would: tap, look,
   reload. From a report the owner passed on from the client: the page, the
   device and the taps. Use made-up data that has the same shape as the
   client's; never their real records. **It must fail for the right reason.**
2. **Stop at the failure and look.** Start the local stack (`npm run db:start`)
   and the app (`npm run dev`, or the Worker build with `npm run worker:build`
   then `npm run worker:preview` when the bug only shows on Cloudflare). Then:
   - The Playwright test MCP: `test_debug` pauses at the failure; read the page
     with `browser_snapshot`, the state with `browser_evaluate`, and
     `browser_console_messages` and `browser_network_requests`.
   - The Chrome DevTools MCP for runtime detail: logpoints, console, network, a
     performance trace at a phone's size.
   - Next.js DevTools MCP: the dev server's errors with source-mapped stacks.
   - Server code: read the stack, add a `console.error`, or write a unit test
     around the pure function in `src/lib/`.
3. **Find the cause, not the symptom.** For "the screen did not change": where
   does the state live (the address, the server, `useOptimistic`, `useState`)?
   Usual causes: props copied into `useState` without a `key`, a save that forgot
   `revalidatePath`, a Node API that workerd lacks.
4. **Fix the app.** The smallest change. Never edit an existing test or screenshot
   to pass, and never add `test.fixme`, `test.only` or an unconditional skip: the
   guard fails the pull request without the owner's `approved-test-change` label.
5. **Prove it.** The reproduction passes. Revert the fix and confirm it fails
   again. Then `npm run check`, `npm run test:e2e`, `npm run guard`.
6. **Leave the factory better.** If a check should have caught this, add it; if
   you lost time, add one line to `docs/factory/friction.md`.

Everything runs on the local seeded database. Never point a debugging browser at
the live site or a staging site with real sign-ins.
