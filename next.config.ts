import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./private-state-artifacts/**/*"],
  },
  serverExternalPackages: ["node:sqlite"],
};

export default nextConfig;
