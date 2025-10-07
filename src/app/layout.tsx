import type { Metadata } from "next";
import type { Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "antd/dist/reset.css";
import Providers from "./providers"; // 👈 Client wrapper
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister"; // 👈 PWA SW registrar
import UserRefresher from "./UserRefresher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://autozonexnxt.netlify.app/";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Autoznonex",
    template: "%s | Autoznonex",
  },
  description: "Autoznonex – Powerful demand and supply analysis, scanners, and trading workflow tools. Alternative to GTF Eye for traders and analysts.",
  keywords: [
    "gtf",
    "gtf eye",
    "demand and supply",
    "demandsupply",
    "demand & supply",
    "gtftraders tool",
    "gtf traders tool",
    "alternative of gtf eye",
    "gtfeye alternative",
    "tool for demand and supply",
    "tool for demadn and supply",
    "demand supply zones",
    "supply and demand trading",
    "trading scanner",
    "market scanner",
    "autozonex",
    "autozonex nxt",
  ],
  manifest: "/manifest.webmanifest",
  verification: {
    google: "VJ1qkQUV7zBeIaFlaPNKFdIyuQePA5Dv_ciuK65LVpo",
  },
  openGraph: {
    title: "Autoznonex",
    description:
      "Autoznonex – Powerful demand and supply analysis, scanners, and trading workflow tools. A modern alternative to GTF Eye.",
    url: siteUrl,
    siteName: "Autoznonex",
    images: [
      {
        url: "/hero.png",
        width: 1200,
        height: 630,
        alt: "Autoznonex – Demand and Supply Trading Tools",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Autoznonex",
    description:
      "Autoznonex – Demand/Supply analysis, scanners, and trading tools. Alternative to GTF Eye.",
    images: ["/hero.png"],
    creator: "@autozonex",
  },
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <UserRefresher />
          <Script
            id="ld-json-website"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'Autoznonex',
                url: siteUrl,
                potentialAction: {
                  '@type': 'SearchAction',
                  target: `${siteUrl}/search?q={search_term_string}`,
                  'query-input': 'required name=search_term_string'
                }
              }),
            }}
          />
          <Script
            id="ld-json-organization"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'Autoznonex',
                url: siteUrl,
                logo: `${siteUrl}/logo.png`,
                sameAs: [],
                description:
                  'Autoznonex – Powerful demand and supply analysis, scanners, and trading workflow tools. A modern alternative to GTF Eye.'
              }),
            }}
          />
          {children}
          {/* Register PWA Service Worker (client-side only) */}
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
