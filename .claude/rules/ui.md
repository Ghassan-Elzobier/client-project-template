---
paths:
  - "src/app/**/*.tsx"
  - "src/components/**/*.tsx"
  - "src/app/globals.css"
---

# UI rules

- The client's design is the spec (`PROJECT.md`, "Design"). Build it from the
  design system: tokens in `src/app/globals.css`, components in
  `src/components/ui.tsx`, all shown at `/design`. Follow the `/design` skill.
  Never a raw hex colour, a one-off pixel font size or a raw grey for text: the
  linter rejects them.
- Phone first unless `PROJECT.md` says otherwise: every page holds at 360 px and
  412 px, then desktop. A responsive grid needs `grid-cols-1` before
  `md:grid-cols-*`, and columns use `minmax(0,1fr)`.
- Fresh pages over speed: never copy props into `useState` without a `key` tied
  to the data; derive the value instead. Saves call `revalidatePath`.
- Buttons say what they do; a busy one sets `busy`. Errors use `Notice` with
  `tone="error"` and say what to do next.
- Text the client gave is used as given, in the page's language
  (`src/lib/project.ts`). Right-to-left languages set `dir`, and layouts use
  logical properties (`ms-*`, `me-*`, `start-*`) so they mirror.
- A component used twice becomes shared and appears on `/design`.
- The browser loads scripts, fonts, pictures and data from the app (and
  Supabase) alone: the Content-Security-Policy in `src/lib/security/csp.ts`. No
  inline `<script>`, no `dangerouslySetInnerHTML`, no event handler in markup.
