import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header / Navbar */}
      <header className="flex justify-between items-center px-8 py-6 bg-white shadow-sm">
        <div className="text-2xl font-bold text-blue-600">MyApp</div>
        <nav className="space-x-6">
          <Link href="#features" className="text-gray-700 hover:text-blue-600">
            Features
          </Link>
          <Link href="#pricing" className="text-gray-700 hover:text-blue-600">
            Pricing
          </Link>
          <Link href="#contact" className="text-gray-700 hover:text-blue-600">
            Contact
          </Link>
          <Link
            href="#"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-8 py-20 max-w-7xl mx-auto">
        <div className="max-w-xl text-center md:text-left">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
            Build Modern <span className="text-blue-600">Web Apps</span> Faster
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            A responsive, elegant UI component library built with Tailwind CSS
            and Next.js. Drop it into your projects and launch quickly.
          </p>
          <div className="space-x-4">
            <Link
              href="#"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
            >
              Get Started
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
            alt="Hero Illustration"
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
            Why Choose <span className="text-blue-600">MyApp?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-6 bg-gray-50 rounded-lg shadow hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-3">⚡ Fast Development</h3>
              <p className="text-gray-600">
                Ship projects quickly with prebuilt components and utilities.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg shadow hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-3">🎨 Modern Design</h3>
              <p className="text-gray-600">
                Clean and responsive UI built with Tailwind CSS.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg shadow hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-3">🔒 Secure</h3>
              <p className="text-gray-600">
                Built-in best practices for performance and security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="pricing"
        className="py-20 bg-blue-600 text-center text-white"
      >
        <h2 className="text-4xl font-bold mb-6">
          Ready to Build Something Amazing?
        </h2>
        <p className="text-lg mb-8">
          Get started today and accelerate your workflow with Next.js + Tailwind
          CSS.
        </p>
        <Link
          href="#"
          className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow hover:bg-gray-100"
        >
          Get Started for Free
        </Link>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-gray-900 text-gray-400 text-center py-6 mt-auto"
      >
        <p>© {new Date().getFullYear()} MyApp. All rights reserved.</p>
      </footer>
    </div>
  );
}
