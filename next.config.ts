import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel serverless function config
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
  // Augmentation du timeout pour les appels OpenAI
  serverExternalPackages: ["openai"],
};

export default nextConfig;
