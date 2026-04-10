import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import Blog from '@/models/Blog';
import dbConnect from '@/lib/mongodb';

export const metadata: Metadata = {
  title: 'Blogs',
  description: 'Read the latest blogs, demand & supply strategies, and trading insights from Autozonex.',
  openGraph: {
    title: 'Blogs | Autozonex',
    description: 'Read the latest blogs, demand & supply strategies, and trading insights from Autozonex.',
    type: 'website'
  }
};

export default async function BlogsPage() {
  await dbConnect();

  const blogsData = await Blog.find({ isPublished: true })
    .sort({ publishedAt: -1 })
    .select("-content")
    .lean();

  const blogs = blogsData.map(b => ({
    ...b,
    _id: b._id.toString(),
    publishedAt: b.publishedAt ? b.publishedAt.toISOString() : null,
    createdAt: b.createdAt ? b.createdAt.toISOString() : null,
    updatedAt: b.updatedAt ? b.updatedAt.toISOString() : null,
  }));

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Hero Banner */}
      <div className="text-center mb-20 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
          <span>Market Insights &amp; Tech</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight dark:text-white text-gray-900">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400">AutoZoneX</span> Blog
        </h1>
        <p className="text-xl dark:text-gray-400 text-gray-500 leading-relaxed">
          Master the charts with high-probability supply &amp; demand strategies, trading psychology, and deep-dives into our scanner algorithms.
        </p>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl dark:border-white/10 border-gray-200 dark:bg-white/5 bg-white backdrop-blur-md">
          <p className="dark:text-gray-400 text-gray-500 text-lg">No publications yet. We are brewing something powerful—check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((b: any) => (
            <Link href={`/blogs/${b.slug}`} key={b._id} className="group block">
              <div
                className="flex flex-col h-full rounded-2xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-2 shadow-lg overflow-hidden
                  dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:border-blue-500/40 dark:hover:shadow-[0_10px_40px_rgba(37,99,235,0.15)]
                  border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-400/40 hover:shadow-[0_10px_40px_rgba(37,99,235,0.08)]"
              >
                {b.coverImage ? (
                  <div className="w-full h-56 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none"></div>
                    <img
                      src={b.coverImage}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute bottom-4 left-4 z-20">
                      <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-200 bg-blue-600/40 backdrop-blur-md rounded-full border border-blue-400/30">
                        {b.tags?.[0] || 'Alpha'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-56 bg-gradient-to-br dark:from-blue-950/40 dark:to-purple-900/20 from-blue-50 to-purple-50 flex flex-col items-center justify-center relative border-b dark:border-white/5 border-gray-100">
                    <div className="dark:text-blue-500/20 text-blue-300/40 text-6xl">📈</div>
                    <div className="absolute bottom-4 left-4 z-20">
                      <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-200 bg-blue-600/40 backdrop-blur-md rounded-full border border-blue-400/30">
                        {b.tags?.[0] || 'Alpha'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col flex-1 p-6 relative">
                  <h2 className="text-xl font-bold dark:text-white text-gray-900 mb-3 leading-snug group-hover:text-blue-500 transition-colors">
                    {b.title}
                  </h2>
                  <p className="dark:text-gray-400 text-gray-500 text-sm flex-1 mb-6 line-clamp-3 leading-relaxed">
                    {b.excerpt || b.metaDescription || "Click to read the full analysis and framework breakdown..."}
                  </p>

                  <div className="flex items-center justify-between pt-5 border-t dark:border-white/10 border-gray-100 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium dark:text-gray-300 text-gray-700">{b.author}</span>
                      <span className="text-xs dark:text-gray-500 text-gray-400 tracking-wide">
                        {new Date(b.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="w-9 h-9 rounded-full dark:bg-white/5 bg-gray-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className="dark:text-gray-500 text-gray-400 group-hover:text-white transition-colors"
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
      )}
    </div>
  );
}
