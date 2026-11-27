---
paths:
  - "e2e/**"
  - "**/*.test.ts"
  - "supabase/tests/**"
  - "playwright.config.ts"
---

# Test rules

- Existing tests and screenshots are the acceptance checks for what the client
  agreed. Add new ones freely; never weaken, skip, delete or re-record an existing
  one to get green. If one is truly wrong, explain why in the pull request; the
  guard then needs the owner's `approved-test-change` label.
- New tests may go in a new file or at the end of an existing `*.test.ts` or
  `e2e/*.spec.ts`. Anything else in an existing test file, and any change to a
  screenshot or `supabase/tests/`, needs the label (`src/lib/ci/test-additions.ts`).
- Each line of `PROJECT.md`'s "Agreed scope" that a pull request builds gets a
  check a test can make: an end-to-end test for what a person sees, a unit test
  beside the code for logic, a pgTAP test for who may do what.
- The end-to-end suite runs on the Worker build in workerd (`npm run test:e2e`),
  at a phone, a small phone (360 px) and a desktop. Every public page goes in
  `PUBLIC_PAGES` (`e2e/env.ts`), which runs axe and the layout checks on it.
- A test that changes data creates its own and puts everything back.
- Screenshot tests have "looks as approved" in their title. They render only in
  CI, so every baseline comes from one browser; update them only for an intended
  design change (`npm run test:e2e:update` in CI, through `@claude`), and look at
  every changed image before committing.
- Server code reads the time from `src/lib/dates/clock.ts`; `APP_FIXED_NOW`
  pins it in the suite.
- Test data is made up. Never the client's records, even "just to see".
