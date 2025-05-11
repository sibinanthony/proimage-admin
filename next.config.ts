import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'libromi-larvel-s3.s3.ap-south-1.amazonaws.com',
      's3.ap-south-1.amazonaws.com',
      'cdn.shopify.com'
    ],
  },
};

export default nextConfig;
