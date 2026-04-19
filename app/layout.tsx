import type { Metadata, Viewport } from "next";
import { ConnectionStatus } from "@/components/nightos/connection-status";
import { FeedbackLink } from "@/components/nightos/feedback-link";
import "./globals.css";

export const metadata: Metadata = {
  title: "NIGHTOS",
  description:
    "夜のお店のためのワークスペース。店舗が入力し、キャストが活用する。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NIGHTOS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#9a7bbb",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        {/* Fonts loaded at runtime via <link> so builds don't require
            Google Fonts network access. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Apple touch icon for "Add to Home Screen" */}
        <link rel="apple-touch-icon" href="/ruri-mama-b.svg" />
      </head>
      <body className="font-sans bg-pearl text-ink antialiased">
        <ConnectionStatus />
        {children}
        <FeedbackLink />
      </body>
    </html>
  );
}
