---
name: design
description: Build or change UI from the client's design so the app stays one cohesive design - pages, components, layout, colour, type, phone layout, languages. Use whenever a change touches what the client's users see.
argument-hint: "[the screen or component]"
---

# Build the client's design

Target: $ARGUMENTS

The client's design is the spec (`PROJECT.md`, "Design": a Figma link, images,
or a written brief). The design system is code: tokens in
`src/app/globals.css` (`@theme`), components in `src/components/ui.tsx`, all of
it shown at `/design`, which previews have and the live site does not. Cohesion
comes from reuse, so start there, not from a blank file.

1. **Look first.** Open the client's design for this screen, `/design`, and the
   nearest existing page. Match what exists.
2. **Tokens from the design.** The template's colours are neutral placeholders.
   The first UI change replaces them with the client's brand (colours, type,
   radius) in `@theme`, keeping the token names, and says so in the pull request.
   After that, tokens only: the linter rejects raw hex, one-off font sizes and raw
   greys. The brand's typeface is self-hosted with `next/font/local` (files in
   `src/app/fonts/`, with a licence that allows it); never a font service.
3. **Phone first**, unless `PROJECT.md` says otherwise: 412 px, then 360 px and
   desktop. `grid-cols-1` before any `md:grid-cols-*`, `minmax(0,1fr)` columns,
   long words wrap (terms and names in other languages run long), tap targets at
   least 44 px (`min-h-11`).
4. **Every state.** Empty, busy (`busy`), error (`Notice tone="error"`) and full.
   Data changes show at once: key client state to its data, never copy props
   into state.
5. **The client's words.** Text from the design or `PROJECT.md`, as given, in the
   page's language. Missing copy is `TODO(copy)` and a question in the pull
   request. Right-to-left languages set `dir` and use logical properties (`ms-*`,
   `ps-*`, `start-*`) so the layout mirrors.
6. **Accessible.** Real buttons and links, labels on fields, colour backed by a
   word, WCAG 2.2 AA contrast (axe runs on every page in `PUBLIC_PAGES`). If one
   of the client's colour pairs fails contrast, use the nearest shade that passes
   and say so in the pull request, so the owner can raise it with the client.
7. **Promote what repeats.** The second time a pattern appears, make it a shared
   component in `src/components/`, replace both uses, and add it to `/design` in
   its states.
8. **Prove it.** `npm run test:e2e`. Once the client has approved a screen, give it
   a screenshot test ("looks as approved" in its title); its baseline renders in CI.
