"use client";

import { useActionState } from "react";
import { Button, Field, Notice } from "@/components/ui";
import { sendMagicLink, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, {});

  if (state.sent) {
    return (
      <Notice tone="success" title="Check your inbox">
        If {state.sent} has access, a sign-in link is on its way. Open it in this browser.
      </Notice>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Field
        name="email"
        label="Email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.test"
        error={state.error}
      />
      <Button className="w-full" busy={pending}>
        {pending ? "Sending…" : "Email me a sign-in link"}
      </Button>
    </form>
  );
}
