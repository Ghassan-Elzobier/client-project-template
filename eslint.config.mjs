// Lint rules are the factory's cheapest sensors: they run on every edit (the
// Claude hooks), every commit and every pull request. Each custom message says
// what to do instead, for whoever reads it next, human or agent.
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import betterTailwind from "eslint-plugin-better-tailwindcss";

// Class names that are not Tailwind utilities on purpose: named groups and peers.
const NOT_TAILWIND = ["^group/.+$", "^peer/.+$"];

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  // The client's design system: tokens in src/app/globals.css, components in
  // src/components/ui.tsx, all shown at /design (the /design skill).
  {
    files: ["src/**/*.tsx"],
    plugins: { "better-tailwindcss": betterTailwind },
    settings: { "better-tailwindcss": { entryPoint: "src/app/globals.css" } },
    rules: {
      "better-tailwindcss/no-unknown-classes": ["error", { ignore: NOT_TAILWIND }],
      "better-tailwindcss/no-conflicting-classes": "error",
      "better-tailwindcss/no-duplicate-classes": "error",
      "better-tailwindcss/no-deprecated-classes": "error",
      "better-tailwindcss/enforce-canonical-classes": "error",
      "better-tailwindcss/no-restricted-classes": [
        "error",
        {
          restrict: [
            {
              pattern: "^(.*:)?text-\\[\\d+(\\.\\d+)?px\\]$",
              message:
                "One-off font size. Use a step of the type scale; if the client's design needs another, add a token to globals.css @theme so every page shares it.",
            },
            {
              pattern:
                "^(.*:)?(bg|text|fill|stroke|border|ring|outline|from|via|to|shadow|decoration)-\\[#[0-9a-fA-F]{3,8}\\]$",
              message:
                "Raw hex colour. Use a token from globals.css @theme (brand, ink, canvas, …); add the client's colour there as a token if it is missing.",
            },
            {
              pattern: "^(.*:)?(text|fill|stroke|placeholder)-(neutral|gray|slate|zinc|stone)-\\d{2,3}$",
              message:
                "Raw grey for text. Use the text role that says why it is grey: ink or ink-muted (globals.css @theme).",
            },
          ],
        },
      ],
    },
  },

  // Only src/proxy.ts refreshes the session; pages read it through the server client.
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/supabase/session"],
              message: "Only src/proxy.ts refreshes the session. Pages use @/lib/supabase/server.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // A file-level import cycle makes load order matter and hides coupling.
      "import/no-cycle": ["error", { ignoreExternal: true }],
    },
  },

  globalIgnores([
    ".next/**",
    ".open-next/**",
    ".wrangler/**",
    "node_modules/**",
    "supabase/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
    ".claude/worktrees/**",
  ]),
]);
