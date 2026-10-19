import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    imageSizes: [32, 48, 64, 96, 128, 256, 384, 512],
  },
};

export default nextConfig;
