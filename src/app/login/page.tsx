import type { Metadata } from "next";
import { Notice, Page } from "@/components/ui";
import { safeNext } from "@/lib/auth/safe-next";
import { supabaseConfigured } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = {
  link: "That link has expired or was already used. Ask for a new one.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  return (
    <Page title="Sign in" lead="For the people who run this site. Use the email you were invited with.">
      <div className="max-w-md space-y-4">
        {error && (
          <Notice tone="error" title="Not signed in">
            {ERRORS[error] ?? ERRORS.link}
          </Notice>
        )}
        {supabaseConfigured() ? (
          <LoginForm next={safeNext(next)} />
        ) : (
          <Notice title="Sign-in is not set up yet">The site has no database connected (docs/SETUP.md).</Notice>
        )}
      </div>
    </Page>
  );
}
