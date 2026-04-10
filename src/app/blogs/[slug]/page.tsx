import React from 'react';
import Link from 'next/link';
import { Metadata, ResolvingMetadata } from 'next';
import Blog from '@/models/Blog';
import dbConnect from '@/lib/mongodb';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://autozonexnxt.netlify.app';

export async function generateMetadata(
  { params }: { params: any },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;

  await dbConnect();
  const b = await Blog.findOne({ slug, isPublished: true }).lean() as any;

  if (!b) return { title: 'Not Found | Autozonex' };

  return {
    title: b.metaTitle || b.title,
    description: b.metaDescription || b.excerpt || `Read ${b.title} on Autozonex.`,
    authors: [{ name: b.author }],
    openGraph: {
      title: b.metaTitle || b.title,
      description: b.metaDescription || b.excerpt,
      type: 'article',
      publishedTime: b.publishedAt,
      tags: b.tags,
      images: b.coverImage ? [b.coverImage] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: b.metaTitle || b.title,
      description: b.metaDescription || b.excerpt,
      images: b.coverImage ? [b.coverImage] : [],
    }
  };
}

export default async function BlogDetail({ params }: { params: any }) {
  const { slug } = await params;

  await dbConnect();
  const blog = await Blog.findOne({ slug, isPublished: true }).lean() as any;

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <h1 className="text-4xl font-bold dark:text-white text-gray-900 mb-4">404 - Not Found</h1>
        <p className="dark:text-gray-400 text-gray-500 mb-8">The requested article could not be found.</p>
        <Link href="/blogs" className="px-6 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-500 transition shadow-[0_0_20px_rgba(37,99,235,0.3)]">
          Return to Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-6 py-4">

      {/* Back Navigation */}
      <Link href="/blogs" className="inline-flex items-center text-blue-500 hover:text-blue-400 transition mb-10 text-sm font-medium tracking-wide">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Insights
      </Link>

      {/* Header Section */}
      <header className="mb-12">
        <div className="flex flex-wrap gap-2 mb-6">
          {blog.tags?.map((t: string) => (
            <span key={t} className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-500/10 border border-blue-500/30 rounded-full">
              {t}
            </span>
          ))}
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold dark:text-white text-gray-900 mb-8 leading-tight tracking-tight">
          {blog.title}
        </h1>

        <div className="flex items-center gap-4 py-6 border-y dark:border-white/10 border-gray-200">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            {blog.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-bold dark:text-white text-gray-900 text-base tracking-wide">{blog.author}</div>
            <div className="dark:text-gray-400 text-gray-500 text-sm">
              {new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • Market Analysis
            </div>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {blog.coverImage && (
        <div className="mb-14 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border dark:border-white/5 border-gray-200 relative group">
          <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay z-10 pointer-events-none"></div>
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full max-h-[550px] object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div
        className="blog-content max-w-none"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* Blog prose styles (theme-aware) */}
      <style dangerouslySetInnerHTML={{ __html: `
        .blog-content { font-size: 1.125rem; line-height: 1.85; }

        /* Light mode */
        .blog-content { color: #374151; }
        .blog-content h2 { margin-top: 2.5em; margin-bottom: 0.75em; font-weight: 800; font-size: 2rem; letter-spacing: -0.025em; color: #111827; }
        .blog-content h3 { margin-top: 2em; margin-bottom: 0.75em; font-weight: 700; font-size: 1.5rem; color: #1f2937; }
        .blog-content p { margin-bottom: 1.5em; }
        .blog-content ul, .blog-content ol { margin-bottom: 1.5em; padding-left: 1.5em; }
        .blog-content li { margin-bottom: 0.5em; }
        .blog-content a { color: #2563eb; text-decoration: underline; }
        .blog-content a:hover { color: #1d4ed8; }
        .blog-content blockquote { border-left: 4px solid #3b82f6; padding: 1.5em; border-radius: 0 0.75rem 0.75rem 0; margin: 2em 0; color: #6b7280; font-style: italic; background: #f0f7ff; }
        .blog-content pre { background: #f3f4f6; padding: 1.5em; border-radius: 0.75rem; overflow-x: auto; border: 1px solid #e5e7eb; }
        .blog-content code { color: #2563eb; background: #eff6ff; padding: 0.2em 0.4em; border-radius: 0.25rem; font-size: 0.875em; border: 1px solid #bfdbfe; }
        .blog-content img { max-width: 100%; border-radius: 0.75rem; margin: 2em 0; transition: transform 0.3s ease; }
        .blog-content img:hover { transform: scale(1.02); }

        /* Dark mode overrides */
        html.dark .blog-content { color: #d1d5db; }
        html.dark .blog-content h2 { color: #fff; }
        html.dark .blog-content h3 { color: #f3f4f6; text-shadow: 0 0 10px rgba(255,255,255,0.1); }
        html.dark .blog-content a { color: #60a5fa; }
        html.dark .blog-content a:hover { color: #93c5fd; }
        html.dark .blog-content blockquote { background: rgba(255,255,255,0.03); color: #9ca3af; box-shadow: inset 2px 0 0 0 #3b82f6; }
        html.dark .blog-content pre { background: #000; border-color: rgba(255,255,255,0.1); box-shadow: inset 0 0 20px rgba(0,0,0,0.5); }
        html.dark .blog-content code { color: #93c5fd; background: rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.2); }
      `}} />

      {/* Footer CTA */}
      <footer className="mt-20 pt-10 border-t dark:border-white/10 border-gray-200 pb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 rounded-2xl p-8 border shadow-xl
          dark:bg-white/5 dark:border-white/5
          bg-gray-50 border-gray-200"
        >
          <div className="flex flex-col gap-3">
            <span className="dark:text-white text-gray-900 font-semibold text-lg tracking-tight">Explore More Topics</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {blog.tags?.map((t: string) => (
                <span key={t} className="px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase transition cursor-pointer
                  dark:bg-black/40 dark:border-white/10 dark:text-gray-300 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/10 dark:hover:text-white
                  bg-white border border-gray-200 text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <Link href="/v1/register" className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold tracking-wide hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition duration-300 hover:-translate-y-1 block text-center w-full md:w-auto">
            Access AutoZoneX Pro
          </Link>
        </div>
      </footer>

    </article>
  );
}
