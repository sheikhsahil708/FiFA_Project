import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/schedule",
        destination: "/matches",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
