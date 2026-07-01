import type { MetadataRoute } from "next";

const BASE_URL = "https://contentflow-ai-node-ia.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { path: "", priority: 1.0, changeFreq: "weekly" as const },
    { path: "/upgrade", priority: 0.8, changeFreq: "monthly" as const },
    { path: "/outils/generateur-post-linkedin", priority: 0.7, changeFreq: "monthly" as const },
    { path: "/outils/generateur-post-twitter", priority: 0.7, changeFreq: "monthly" as const },
    { path: "/alternatives/taplio", priority: 0.7, changeFreq: "monthly" as const },
    { path: "/mentions-legales", priority: 0.3, changeFreq: "yearly" as const },
    { path: "/cgv", priority: 0.3, changeFreq: "yearly" as const },
    { path: "/politique-de-confidentialite", priority: 0.3, changeFreq: "yearly" as const },
  ];

  return staticPages.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFreq,
    priority: page.priority,
  }));
}
