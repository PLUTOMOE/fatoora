import type { NextConfig } from "next";

const nextConfig: any = {
  devIndicators: false,
  turbopack: {
    root: process.cwd(),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
