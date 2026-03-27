import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "www.animal.go.kr" },
      { protocol: "http", hostname: "www.daejeon.go.kr" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/regions/:path*",
        destination: `${process.env.API_BASE_URL}/api/regions/:path*`,
      },
      {
        source: "/api/animals/refresh",
        destination: `${process.env.API_BASE_URL}/api/animals/refresh`,
      },
    ];
  },
};

export default nextConfig;
