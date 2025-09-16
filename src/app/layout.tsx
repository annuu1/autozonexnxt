import type { Metadata } from "next";
import type { Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "antd/dist/reset.css";
import Providers from "./providers"; // 👈 Client wrapper
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister"; // 👈 PWA SW registrar

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Autoznonex",
  description: "The application to get the automated demand and supply.",
  manifest: "/manifest.webmanifest",
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
          {children}
          {/* Register PWA Service Worker (client-side only) */}
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
