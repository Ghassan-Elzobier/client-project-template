import Link from "next/link";
import { Page } from "@/components/ui";
import { PROJECT } from "@/lib/project";

// The starting page. The first screen from the client's design replaces it.
export default function Home() {
  return (
    <Page title={PROJECT.name} lead="Coming soon.">
      <p className="text-ink-muted">
        People who run this site can{" "}
        <Link href="/admin" className="font-semibold text-brand underline underline-offset-4">
          sign in
        </Link>
        .
      </p>
    </Page>
  );
}
