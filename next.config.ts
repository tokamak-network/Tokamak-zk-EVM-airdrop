import type { NextConfig } from "next";

const tonigmaAirdropUrl = "https://airdrop.tonigma.network";

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
        destination: `${tonigmaAirdropUrl}/:path*`,
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
        destination: `${tonigmaAirdropUrl}/:path*`,
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "airdrop.tonnel.io",
          },
        ],
        destination: `${tonigmaAirdropUrl}/:path*`,
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
