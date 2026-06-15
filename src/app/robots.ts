import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/success", "/welcome"],
    },
    sitemap: "https://contentflow-ai-node-ia.vercel.app/sitemap.xml",
  };
}
