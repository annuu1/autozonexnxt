"use client";

import Link from "next/link";
import { ThunderboltFilled } from "@ant-design/icons";
import PublicThemeToggle from "@/components/common/PublicThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";

export default function PublicNavbar() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-colors duration-500"
      style={{
        background: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.7)",
        borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <ThunderboltFilled className="text-white text-lg" />
          </div>
          <Link
            href="/"
            className="text-xl font-bold tracking-tight transition-colors"
            style={{ color: isDark ? "#fff" : "#111" }}
          >
            AutoZone<span className="text-blue-500">X</span>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link
            href="/#features"
            className="transition-colors hover:text-blue-500"
            style={{ color: isDark ? "#9ca3af" : "#666" }}
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            className="transition-colors hover:text-blue-500"
            style={{ color: isDark ? "#9ca3af" : "#666" }}
          >
            Pricing
          </Link>
          <Link
            href="/blogs"
            className="transition-colors hover:text-blue-500"
            style={{ color: isDark ? "#d1d5db" : "#555" }}
          >
            Blogs
          </Link>
          <Link
            href="/#contact"
            className="transition-colors hover:text-blue-500"
            style={{ color: isDark ? "#9ca3af" : "#666" }}
          >
            Contact
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <PublicThemeToggle />
          <Link
            href="/v1/login"
            className="text-sm ml-4 mr-4 font-medium transition hidden sm:inline-block hover:text-blue-500"
            style={{ color: isDark ? "#d1d5db" : "#555" }}
          >
            Login
          </Link>
          <Link
            href="/v1/register"
            className="px-5 py-2 text-sm font-semibold rounded-full transition shadow-lg"
            style={{
              background: isDark ? "#fff" : "#111",
              color: isDark ? "#000" : "#fff",
              boxShadow: isDark
                ? "0 0 20px rgba(255,255,255,0.2)"
                : "0 0 20px rgba(0,0,0,0.15)",
            }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
