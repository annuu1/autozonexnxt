import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header / Navbar */}
      <header className="flex justify-between items-center px-8 py-6 bg-white/10 backdrop-blur-md shadow-lg sticky top-0 z-50 rounded-b-xl">
        <div className="text-2xl font-extrabold text-blue-400 drop-shadow">
          AutoZoneX
        </div>
        <nav className="space-x-6 hidden md:flex">
          <Link href="#features" className="hover:text-blue-400 transition">
            Features
          </Link>
          <Link href="#about" className="hover:text-blue-400 transition">
            About
          </Link>
          <Link href="#contact" className="hover:text-blue-400 transition">
            Contact
          </Link>
          <Link
            href="/v1/login"
            className="px-4 py-2 bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg shadow-lg backdrop-blur-sm transition"
          >
            Login
          </Link>
          <Link
            href="/v1/register"
            className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg shadow-lg backdrop-blur-sm transition"
          >
            Signup
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-8 py-20 max-w-7xl mx-auto">
        <div className="max-w-xl text-center md:text-left">
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Smarter{" "}
            <span className="text-blue-400 drop-shadow">Stock Analysis</span>{" "}
            with Demand & Supply Zones
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            AutoZoneX helps traders identify institutional demand & supply zones,
            track setups across multiple timeframes, and get instant alerts — all
            in one dashboard.
          </p>
          <div className="space-x-4">
            <Link
              href="/v1/login"
              className="px-6 py-3 bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg shadow-lg backdrop-blur-sm transition"
            >
              Launch Dashboard
            </Link>
            <Link
              href="#features"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg shadow-lg backdrop-blur-md transition"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className="mt-12 md:mt-0 md:ml-8">
          <Image
            src="/hero.png"
            alt="Stock Market Illustration"
            width={500}
            height={400}
            className="rounded-xl shadow-2xl border border-white/10"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20 blur-3xl"></div>
        <div className="max-w-6xl mx-auto px-8 relative">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Traders Choose{" "}
            <span className="text-blue-400">AutoZoneX</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              "📌 2600+ Liquid NSE Stocks loaded for DZ tracking",
              "⚡ Auto Alerts when a stock nears, enters, or breaches a demand zone",
              "💬 User Reactions on DZ — crowd sentiment in real time",
              "🎯 Team Picks = location + execution inside the zone",
              "📊 Zone Scanner for approaching or entered DZ stocks",
              "🔍 Smart Search Bar to find stocks instantly",
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition border border-white/10"
              >
                <p className="text-lg font-medium">{feature}</p>
              </div>
            ))}
          </div>

          {/* Coming Soon Section */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center text-blue-400 mb-8">
              🚀 Coming Soon
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                "🔴 Supply Zone Alerts (like DZ, but flipped)",
                "💬 Comments on Every Trade",
                "📈 Advanced Bull Picks / Breakout Picks",
                "📬 Unlimited Alerts Direct to Telegram",
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-white/5 backdrop-blur-md rounded-xl shadow-md hover:shadow-lg transition border border-white/10"
                >
                  <p className="text-lg font-medium text-gray-300">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="about"
        className="py-20 bg-gradient-to-r from-blue-700 via-blue-600 to-purple-700 text-center rounded-t-3xl"
      >
        <h2 className="text-4xl font-bold mb-6">Trade Smarter, Not Harder</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-100">
          AutoZoneX empowers you with structured demand-supply trading — no more
          guesswork, just rules and alerts that keep you ahead.
        </p>
        <Link
          href="/v1/login"
          className="px-8 py-4 bg-white/90 text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-white transition"
        >
          Login
        </Link>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-black/70 backdrop-blur-md text-gray-400 text-center py-6 mt-auto border-t border-white/10"
      >
        <p>
          © {new Date().getFullYear()} AutoZoneX. All rights reserved. | Contact:{" "}
          <a href="mailto:support@autozonex.com" className="hover:text-blue-400">
            support@autozonex.com
          </a>
        </p>
      </footer>
    </div>
  );
}
