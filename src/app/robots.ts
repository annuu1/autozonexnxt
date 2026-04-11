import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://autozonexnxt.netlify.app").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/v1/dashboard",
          "/v1/dashboard/",
          "/v1/dashboard/*",
          "/v1/auth",
          "/v1/auth/*",
          "/v1/admin",
          "/v1/admin/*",
          "/v1/user",
          "/v1/user/*",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
