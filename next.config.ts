import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // 🚀 Allow production builds to succeed even if there are ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 🚀 Allow production builds to succeed even if there are TS type errors
    ignoreBuildErrors: true,
  },
  // react: {
  //   // 🚀 Allow production builds to succeed even if there are React errors
  //   strictMode: false,
  // },
};

export default nextConfig;
