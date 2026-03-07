import type { Metadata } from "next";
import "./globals.css";
import { ProjectOverridesProvider } from "@/context/ProjectOverrides";
import { LocalProjectsProvider } from "@/context/LocalProjects";
import { ClientChatDrawerProvider } from "@/context/ClientChatDrawer";
import { ThemeProvider } from "@/context/ThemeContext";
import { ClientChatDrawer } from "@/components/ClientChatDrawer";

export const metadata: Metadata = {
  title: "YamBoard",
  description: "Agence Yam — espace client",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = stored || (prefersDark ? 'dark' : 'light');
                  var html = document.documentElement;
                  html.setAttribute('data-theme', theme);
                  html.classList.toggle('dark', theme === 'dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <LocalProjectsProvider>
            <ProjectOverridesProvider>
              <ClientChatDrawerProvider>
                {children}
                <ClientChatDrawer />
              </ClientChatDrawerProvider>
            </ProjectOverridesProvider>
          </LocalProjectsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
