import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YamBoard",
  description: "Agence Yam — espace client",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
