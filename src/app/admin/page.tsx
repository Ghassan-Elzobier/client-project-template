import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button, Notice, Page } from "@/components/ui";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin" };

const ROLE_LABELS: Record<string, string> = { admin: "Admin", editor: "Editor" };

// The signed-in area's front page. The proxy sends signed-out visitors to
// /login; what an account may do comes from the database (app_my_role).
export default async function AdminPage() {
  if (!supabaseConfigured()) redirect("/login");
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/login?next=/admin");
  const { data: role } = await supabase.rpc("app_my_role");

  return (
    <Page title="Admin" lead={`Signed in as ${String(data.claims.email ?? "an invited account")}.`}>
      {typeof role === "string" && ROLE_LABELS[role] ? (
        <p>
          Your role: <strong>{ROLE_LABELS[role]}</strong>.
        </p>
      ) : (
        <Notice title="No role yet">An admin needs to give this account a role before it can change anything.</Notice>
      )}
      <form action="/auth/signout" method="post">
        <Button variant="secondary">Sign out</Button>
      </form>
    </Page>
  );
}
