import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { PROJECT } from "@/lib/project";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: PROJECT.name, template: `%s · ${PROJECT.name}` },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  // Every page renders for its own request: the Content-Security-Policy's nonce
  // needs it (src/lib/security/csp.ts), and saves show at once.
  await connection();
  return (
    <html lang={PROJECT.lang} dir={PROJECT.dir}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
