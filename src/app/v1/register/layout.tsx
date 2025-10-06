import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
  title: "Register | Autoznonex",
  description: "Create your Autoznonex account to access demand and supply trading tools.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
