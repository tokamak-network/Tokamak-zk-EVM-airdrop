import type { MetadataRoute } from "next";

const siteUrl = "https://airdrop.tonnel.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${siteUrl}/status`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8,
    },
  ];
}
