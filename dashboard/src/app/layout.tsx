import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "getBrandon — Dashboard clients",
  description: "Vue d'ensemble des clients et wikis getBrandon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${syne.variable} ${jetbrains.variable} font-sans antialiased bg-[#0a0a0b] text-zinc-200`}
      >
        {children}
      </body>
    </html>
  );
}
