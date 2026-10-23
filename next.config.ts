import type { NextConfig } from "next";

const nextConfig: any = {
  devIndicators: false,
  turbopack: {
    root: process.cwd(),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    agentUpgrade: "security",
  },
};

export default nextConfig;
