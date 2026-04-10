import type { MetadataRoute } from "next";
import Blog from '@/models/Blog';
import dbConnect from '@/lib/mongodb';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://autozonexnxt.netlify.app").replace(/\/$/, "");

// Public routes to include in sitemap (auth/private routes excluded)
const staticRoutes = [
  "",
  "/v1/login",
  "/v1/register",
  "/v1/forgot-password",
  "/blogs"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticUrls = staticRoutes.map((path) => {
    // Set higher priority for main pages
    let priority = 0.5;
    let changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"] = "weekly";

    if (path === "") {
      priority = 1.0;
      changeFrequency = "weekly";
    }

    return {
      url: `${siteUrl}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    };
  });

  let blogUrls: MetadataRoute.Sitemap = [];
  try {
    await dbConnect();
    const blogs = await Blog.find({ isPublished: true }).select("slug publishedAt updatedAt").lean();
    
    blogUrls = blogs.map((b: any) => ({
      url: `${siteUrl}/blogs/${b.slug}`,
      lastModified: new Date(b.publishedAt || b.updatedAt),
      changeFrequency: "monthly" as MetadataRoute.Sitemap[0]["changeFrequency"],
      priority: 0.8,
    }));
  } catch (err) {
    console.error("Failed to fetch blogs for sitemap:", err);
  }

  return [...staticUrls, ...blogUrls];
}
