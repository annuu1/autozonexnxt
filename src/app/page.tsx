import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header / Navbar */}
      <header className="flex justify-between items-center px-8 py-6 bg-white shadow-sm">
        <div className="text-2xl font-bold text-blue-600">AutoZoneX</div>
        <nav className="space-x-6">
          <Link href="#features" className="text-gray-700 hover:text-blue-600">
            Features
          </Link>
          <Link href="#about" className="text-gray-700 hover:text-blue-600">
            About
          </Link>
          <Link href="#contact" className="text-gray-700 hover:text-blue-600">
            Contact
          </Link>
          <Link
            href="/v1/dashboard"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Dashboard
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-8 py-20 max-w-7xl mx-auto">
        <div className="max-w-xl text-center md:text-left">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
            Smarter <span className="text-blue-600">Stock Analysis</span> with
            Demand & Supply Zones
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            AutoZoneX helps traders identify institutional demand & supply zones,
            track multi-timeframe setups, and get instant alerts — all in one
            dashboard.
          </p>
          <div className="space-x-4">
            <Link
              href="/v1/dashboard"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
            >
              Launch Dashboard
            </Link>
            <Link
              href="#features"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
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
            className="rounded-xl shadow-lg"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Why Traders Choose{" "}
            <span className="text-blue-600">AutoZoneX</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-6 bg-gray-50 rounded-lg shadow hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-3">📊 Zone Detection</h3>
              <p className="text-gray-600">
                Identify demand & supply zones with precise candle-based rules.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg shadow hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-3">⏳ Multi-Timeframe</h3>
              <p className="text-gray-600">
                Top-down analysis from weekly to intraday, with parent-child
                zone tracking.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg shadow hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-3">🔔 Trade Alerts</h3>
              <p className="text-gray-600">
                Get notified when price approaches or enters your zone setups.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg shadow hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-3">👤 Role-Based Access</h3>
              <p className="text-gray-600">
                Admin, Manager, Agent, or Trader — features adapt to your role.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg shadow hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-3">📝 Trade Journal</h3>
              <p className="text-gray-600">
                Log personal notes, strategy alignment, and track performance.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg shadow hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-3">☁ Cloud Sync</h3>
              <p className="text-gray-600">
                Access your analysis and zones anywhere, securely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="py-20 bg-blue-600 text-center text-white">
        <h2 className="text-4xl font-bold mb-6">
          Trade Smarter, Not Harder
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          AutoZoneX empowers you with structured demand-supply trading — no more
          guesswork, just rules and alerts that keep you ahead.
        </p>
        <Link
          href="/v1/dashboard"
          className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow hover:bg-gray-100"
        >
          Open Dashboard
        </Link>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-gray-900 text-gray-400 text-center py-6 mt-auto"
      >
        <p>
          © {new Date().getFullYear()} AutoZoneX. All rights reserved. | Contact:
          support@autozonex.com
        </p>
      </footer>
    </div>
  );
}
