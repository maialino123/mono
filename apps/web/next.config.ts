import "@cyberk-flow/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/mint",
        permanent: true,
      },
    ];
  },
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: ["shiki"],
};

export default nextConfig;
