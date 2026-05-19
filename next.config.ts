import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Spline runtime needs this for the WASM/canvas to work properly.
  // Drei tiene cientos de helpers — sin esto, importar uno trae al barrel
  // entero al bundle. framer-motion también se beneficia del tree-shake
  // explícito de Next.
  experimental: {
    optimizePackageImports: [
      "@splinetool/runtime",
      "@react-three/drei",
      "framer-motion",
    ],
  },
};

export default nextConfig;
