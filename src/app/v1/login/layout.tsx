import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
  title: "Login | Autoznonex",
  description: "Login to access Autoznonex demand and supply trading tools.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
