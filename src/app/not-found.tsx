import Link from "next/link";
import { Page } from "@/components/ui";

export default function NotFound() {
  return (
    <Page title="Page not found" lead="This address doesn't lead anywhere, or the page has moved.">
      <Link href="/" className="font-semibold text-brand underline underline-offset-4">
        Go to the home page
      </Link>
    </Page>
  );
}
