import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Spline runtime needs this for the WASM/canvas to work properly.
  experimental: {
    optimizePackageImports: ["@splinetool/runtime"],
  },
};

export default nextConfig;
