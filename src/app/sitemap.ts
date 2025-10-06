import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Public routes to include in sitemap (auth/private routes excluded)
const routes = [
  "/",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routes.map((path) => {
    // Set higher priority for main pages
    let priority = 0.5;
    let changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"] = "weekly";

    if (path === "/") {
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
}
