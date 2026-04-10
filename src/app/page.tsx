"use client";

import Link from "next/link";
import FeatureSlider from "@/components/home/FeatureSlider";
import { ArrowRightOutlined } from "@ant-design/icons";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";
import PublicBackground from "@/components/layout/PublicBackground";
import { useTheme } from "@/contexts/ThemeContext";

export default function Home() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="min-h-screen font-sans transition-colors duration-500 flex flex-col"
      style={{
        background: isDark ? "#000" : "#fafbfc",
        color: isDark ? "#fff" : "#111",
      }}
    >
      <PublicBackground />
      <PublicNavbar />

      {/* --- Main Content --- */}
      <main className="relative z-10 pt-32 pb-20 flex-1">

        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-6 text-center mb-24">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            <span>Live Market Analysis v2.0</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Precision Trading with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]">
              Supply &amp; Demand Zones
            </span>
          </h1>

          <p
            className="text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: isDark ? "#9ca3af" : "#666" }}
          >
            Stop guessing. Start tracking institutional zones with AutoZoneX.
            Real-time scanner, advanced journaling, and automated alerts for the serious trader.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/v1/register" className="h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg flex items-center justify-center transition hover:scale-105 shadow-[0_0_40px_rgba(37,99,235,0.4)]">
              Start Free Trial <ArrowRightOutlined className="ml-2" />
            </Link>
            <Link
              href="/blogs"
              className="h-14 px-8 rounded-full border font-medium text-lg flex items-center justify-center transition"
              style={{
                borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                color: isDark ? "#fff" : "#333",
              }}
            >
              📈 Read Insights
            </Link>
          </div>

          {/* Stats Bar */}
          <div
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t pt-8 max-w-4xl mx-auto"
            style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }}
          >
            {[
              { label: "Active Traders", value: "2,500+" },
              { label: "Stocks Tracked", value: "2,600+" },
              { label: "Zones Detected", value: "150k+" },
              { label: "Daily Alerts", value: "10k+" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div
                  className="text-sm uppercase tracking-wider"
                  style={{ color: isDark ? "#6b7280" : "#9ca3af" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Slider Showcase */}
        <div id="demo" className="mb-24">
          <FeatureSlider />
        </div>

        {/* Value Proposition Grid */}
        <section id="features" className="max-w-7xl mx-auto px-6 mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to <span className="text-blue-400">dominate</span> the market</h2>
            <p style={{ color: isDark ? "#9ca3af" : "#666" }}>Engineered for speed, accuracy, and discipline.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Institutional Zones", desc: "Automatically plotted demand & supply zones across multiple timeframes.", icon: "🏦" },
              { title: "Smart Scanner", desc: "Filter 2600+ stocks by sector, liquidity, and zone proximity in milliseconds.", icon: "⚡" },
              { title: "Trade Journaling", desc: "Log trades with psychological tags, setup tracking, and PnL analytics.", icon: "📔" },
              { title: "Instant Alerts", desc: "Get notified via Telegram the second price hits your zone.", icon: "🔔" },
              { title: "Sector Heatmaps", desc: "Visualize sector strength and rotation to pick the right stocks.", icon: "🌡️" },
              { title: "Strategy Testing", desc: "Simulate setups and track win-rates before risking real capital.", icon: "🧪" },
            ].map((card, i) => (
              <div
                key={i}
                className="group p-8 rounded-2xl border transition hover:border-blue-500/30"
                style={{
                  borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                  background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)",
                  boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                <p style={{ color: isDark ? "#9ca3af" : "#666" }} className="leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section
          className="max-w-4xl mx-auto px-6 text-center py-20 border-t"
          style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }}
        >
          <h2 className="text-4xl font-bold mb-6">Ready to upgrade your trading?</h2>
          <p className="mb-8 text-lg" style={{ color: isDark ? "#9ca3af" : "#666" }}>
            Join thousands of smart traders using AutoZoneX today.
          </p>
          <Link
            href="/v1/register"
            className="inline-block px-10 py-4 font-bold rounded-lg transition"
            style={{
              background: isDark ? "#fff" : "#111",
              color: isDark ? "#000" : "#fff",
              boxShadow: isDark
                ? "0 0 30px rgba(255,255,255,0.3)"
                : "0 0 30px rgba(0,0,0,0.15)",
            }}
          >
            Get Started Now
          </Link>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
