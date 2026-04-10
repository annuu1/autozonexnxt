import React from 'react';
import { Metadata } from 'next';
import Blog from '@/models/Blog';
import dbConnect from '@/lib/mongodb';
import BlogList from '@/components/blogs/BlogList';

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

      <BlogList blogs={blogs} />
    </div>
  );
}
