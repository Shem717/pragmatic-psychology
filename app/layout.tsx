import type { Metadata } from "next";
import Script from "next/script";
import { Workspace } from "@/components/Workspace";
import { Header, Sidebar, Footer } from "@/components/Shell";
import "./globals.css";
import "./observatory.css";
import "./sovereign.css";
import "./epic.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://pragmatic-psychology.vercel.app"),
  title: {
    default: "Sovereign Psychology Observatory",
    template: "%s | Sovereign Psychology",
  },
  description:
    "Compare perspectives, connect intention to conduct, and follow the evidence. Research-informed education by Samuel Raymond Clow.",
  openGraph: {
    title: "Sovereign Psychology Observatory",
    description: "See more clearly. Respond with greater freedom.",
    type: "website",
  },
  icons: { icon: "/favicon.svg" },
  robots: { index: true, follow: true },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-atmosphere="Night"
      data-mode="Immersive"
      data-paused="false"
      suppressHydrationWarning
    >
      <head>
        <Script src="/preferences.js" strategy="beforeInteractive" />
      </head>
      <body>
        <Workspace>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Header />
          <div className="workspace">
            <Sidebar />
            <div className="workspace-content">
              <main id="main" tabIndex={-1}>
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </Workspace>
      </body>
    </html>
  );
}
