"use client";

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

export default function BlogList({ blogs }: { blogs: any[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (blogs.length === 0) {
    return (
      <div 
        className="text-center py-20 border rounded-2xl backdrop-blur-md transition-colors duration-500"
        style={{
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
          background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)",
          color: isDark ? "#9ca3af" : "#6b7280"
        }}
      >
        <p className="text-lg">No publications yet. We are brewing something powerful—check back soon!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {blogs.map((b: any) => (
        <Link href={`/blogs/${b.slug}`} key={b._id} className="group block">
          <div
            className="flex flex-col h-full rounded-2xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-2 shadow-lg overflow-hidden"
            style={{
              borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
              background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,1)",
              boxShadow: isDark ? "0 4px 6px rgba(0,0,0,0.1)" : "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            {b.coverImage ? (
              <div className="w-full h-56 overflow-hidden relative">
                <div 
                  className="absolute inset-0 z-10 pointer-events-none transition-colors duration-500"
                  style={{
                    background: isDark 
                      ? "linear-gradient(to top, rgba(0,0,0,0.8), transparent, transparent)"
                      : "linear-gradient(to top, rgba(255,255,255,0.6), transparent, transparent)"
                  }}
                ></div>
                <img
                  src={b.coverImage}
                  alt={b.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute bottom-4 left-4 z-20">
                  <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-200 bg-blue-600/60 backdrop-blur-md rounded-full border border-blue-400/30">
                    {b.tags?.[0] || 'Alpha'}
                  </span>
                </div>
              </div>
            ) : (
              <div 
                className="w-full h-56 flex flex-col items-center justify-center relative border-b transition-colors duration-500"
                style={{
                  background: isDark 
                    ? "linear-gradient(to bottom right, rgba(23,37,84,0.4), rgba(88,28,135,0.2))"
                    : "linear-gradient(to bottom right, rgba(239,246,255,1), rgba(250,245,255,1))",
                  borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
                }}
              >
                <div className="text-6xl" style={{ color: isDark ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.4)" }}>📈</div>
                <div className="absolute bottom-4 left-4 z-20">
                  <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-200 bg-blue-600/60 backdrop-blur-md rounded-full border border-blue-400/30">
                    {b.tags?.[0] || 'Alpha'}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col flex-1 p-6 relative">
              <h2 
                className="text-xl font-bold mb-3 leading-snug group-hover:text-blue-500 transition-colors"
                style={{ color: isDark ? "#fff" : "#111" }}
              >
                {b.title}
              </h2>
              <p 
                className="text-sm flex-1 mb-6 line-clamp-3 leading-relaxed transition-colors"
                style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
              >
                {b.excerpt || b.metaDescription || "Click to read the full analysis and framework breakdown..."}
              </p>

              <div 
                className="flex items-center justify-between pt-5 border-t mt-auto transition-colors"
                style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium" style={{ color: isDark ? "#d1d5db" : "#374151" }}>{b.author}</span>
                  <span className="text-xs tracking-wide" style={{ color: isDark ? "#6b7280" : "#9ca3af" }}>
                    {new Date(b.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-blue-600"
                  style={{ 
                    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="transition-colors group-hover:text-white"
                    style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
