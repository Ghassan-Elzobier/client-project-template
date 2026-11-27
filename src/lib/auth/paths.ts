// Which pages need a sign-in. Everything else is public, which suits most client
// apps: a public side, and an area for the people who run it. Add a prefix here
// when the client's brief (PROJECT.md, "Who uses it") puts a page behind sign-in.
// This only steers people to /login; the database still decides what each
// signed-in account may do.
const SIGNED_IN = ["/admin"];

/** Whether a path needs a signed-in visitor. */
export function needsSignIn(path: string): boolean {
  return SIGNED_IN.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}
