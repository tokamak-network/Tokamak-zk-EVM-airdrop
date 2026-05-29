import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "tonnel.io",
          },
        ],
        destination: "https://airdrop.tonnel.io/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.tonnel.io",
          },
        ],
        destination: "https://airdrop.tonnel.io/:path*",
        permanent: true,
      },
    ];
  },
  outputFileTracingIncludes: {
    "/*": ["./private-state-artifacts/**/*"],
  },
  serverExternalPackages: ["node:sqlite"],
};

export default nextConfig;
