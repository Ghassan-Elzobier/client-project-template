// The app's clock: the one place server code asks what time it is (today, this
// week, how late in the day). Durations, deadlines and token lifetimes keep
// using Date.now(), since they measure time passing.
//
// APP_FIXED_NOW pins the clock for the end-to-end suite, so a page shows the
// same day on every run. It is ignored on the live site (APP_ENV "production"),
// so a stray value can never freeze it.

/** The current instant, or the pinned one in a test run. */
export function now(): Date {
  const fixed = process.env.APP_FIXED_NOW;
  if (fixed && process.env.APP_ENV !== "production") {
    const pinned = new Date(fixed);
    if (!Number.isNaN(pinned.getTime())) return pinned;
  }
  return new Date();
}
