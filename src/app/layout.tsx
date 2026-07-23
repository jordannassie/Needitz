import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@/components/Analytics";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://needitz.com"),
  title: "Needitz — Tell Us What You Need",
  description:
    "Submit what you need, your budget, deadline, and location. Needitz will review your request and contact you if we can help.",
  openGraph: {
    title: "Needitz — Tell Us What You Need",
    description:
      "Submit what you need, your budget, deadline, and location. Needitz will review your request and contact you if we can help.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://needitz.com",
    siteName: "Needitz",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Needitz — Tell Us What You Need",
    description: "Submit what you need, your budget, deadline, and location.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
