import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Button, Field, Notice, Page } from "@/components/ui";
import { appEnv } from "@/lib/env";

export const metadata: Metadata = { title: "Design" };

// Every shared piece in its states, for the owner and the client to review on a
// preview before pages use them. Never on the live site.
export default function DesignPage() {
  if (appEnv() === "production") notFound();
  return (
    <Page
      title="Design"
      lead="The shared pieces of the interface, in their states. They follow the client's design from src/app/globals.css and src/components/ui.tsx."
    >
      <Section title="Colours">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Swatch name="brand" className="bg-brand" />
          <Swatch name="ink" className="bg-ink" />
          <Swatch name="ink-muted" className="bg-ink-muted" />
          <Swatch name="surface" className="bg-surface" />
          <Swatch name="line" className="bg-line" />
          <Swatch name="danger" className="bg-danger" />
          <Swatch name="success" className="bg-success" />
          <Swatch name="canvas" className="bg-canvas" />
        </ul>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap gap-3">
          <Button type="button">Save</Button>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
          <Button type="button" busy>
            Saving…
          </Button>
        </div>
      </Section>

      <Section title="Fields">
        <div className="space-y-4">
          <Field name="design-email" label="Email" type="email" placeholder="you@example.test" />
          <Field name="design-name" label="Name" hint="As it should appear on the page." />
          <Field name="design-code" label="Code" defaultValue="12" error="Enter the six digits from the email." />
        </div>
      </Section>

      <Section title="Notices">
        <div className="space-y-3">
          <Notice title="Saved">The change is live.</Notice>
          <Notice tone="success" title="Sent">
            A sign-in link is on its way.
          </Notice>
          <Notice tone="error" title="Not saved">
            The connection dropped. Try again.
          </Notice>
        </div>
      </Section>
    </Page>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <li className="space-y-1">
      <div className={`h-12 rounded-md border border-line ${className}`} />
      <p className="font-mono text-sm">{name}</p>
    </li>
  );
}
