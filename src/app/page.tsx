"use client";

import Image from "next/image";
import Link from "next/link";
import FeatureSlider from "@/components/home/FeatureSlider";
import { ArrowRightOutlined, ThunderboltFilled } from "@ant-design/icons";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30 selection:text-blue-200">

      {/* --- Dynamic Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)'
          }}
        ></div>
        {/* Glowing Orbs */}
        <div className="absolute top-[-20%] left-[20%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]"></div>
      </div>

      {/* ---- Navbar ---- */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
              <ThunderboltFilled className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              AutoZone<span className="text-blue-500">X</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="#contact" className="hover:text-white transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/v1/login" className="text-sm font-medium text-gray-300 hover:text-white transition">Login</Link>
            <Link href="/v1/register" className="px-5 py-2 text-sm font-semibold bg-white text-black rounded-full hover:bg-gray-200 transition shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="relative z-10 pt-32 pb-20">

        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-6 text-center mb-24">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            <span>Live Market Analysis v2.0</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Precision Trading with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]">
              Supply & Demand Zones
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop guessing. Start tracking institutional zones with AutoZoneX.
            Real-time scanner, advanced journaling, and automated alerts for the serious trader.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/v1/register" className="h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg flex items-center justify-center transition hover:scale-105 shadow-[0_0_40px_rgba(37,99,235,0.4)]">
              Start Free Trial <ArrowRightOutlined className="ml-2" />
            </Link>
            <Link href="#demo" className="h-14 px-8 rounded-full border border-white/20 hover:bg-white/5 text-white font-medium text-lg flex items-center justify-center transition">
              View Live Demo
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-8 max-w-4xl mx-auto">
            {[
              { label: "Active Traders", value: "2,500+" },
              { label: "Stocks Tracked", value: "2,600+" },
              { label: "Zones Detected", value: "150k+" },
              { label: "Daily Alerts", value: "10k+" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
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
            <p className="text-gray-400">Engineered for speed, accuracy, and discipline.</p>
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
              <div key={i} className="group p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition hover:border-blue-500/30">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                <p className="text-gray-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="max-w-4xl mx-auto px-6 text-center py-20 border-t border-white/10">
          <h2 className="text-4xl font-bold mb-6">Ready to upgrade your trading?</h2>
          <p className="text-gray-400 mb-8 text-lg">Join thousands of smart traders using AutoZoneX today.</p>
          <Link href="/v1/register" className="inline-block px-10 py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            Get Started Now
          </Link>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-gray-900/50 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} AutoZoneX Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
