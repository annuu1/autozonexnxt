"use client";

import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

export default function PublicFooter() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <footer
      className="border-t py-12 transition-colors duration-500"
      style={{
        background: isDark ? "rgba(17,24,39,0.5)" : "rgba(249,250,251,1)",
        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm gap-4"
        style={{ color: isDark ? "#6b7280" : "#9ca3af" }}
      >
        <p>&copy; {new Date().getFullYear()} AutoZoneX Inc. Decoding the Markets.</p>
        <div className="flex space-x-6">
          <Link href="/blogs" className="hover:text-blue-500 transition">Insights</Link>
          <a href="#" className="hover:text-blue-500 transition">Privacy</a>
          <a href="#" className="hover:text-blue-500 transition">Terms</a>
        </div>
      </div>
    </footer>
  );
}
