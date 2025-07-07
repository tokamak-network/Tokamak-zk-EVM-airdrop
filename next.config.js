/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost"],
  },
  env: {
    CUSTOM_KEY: "tokamak-zk-evm-airdrop",
  },
};

module.exports = nextConfig;
