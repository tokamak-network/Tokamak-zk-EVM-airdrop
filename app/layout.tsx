import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const siteUrl = "https://airdrop.tonnel.io";
const siteTitle = "TON AIRDROP ON TONNEL";
const siteDescription =
  "Get 25 TON per valid private-state transfer on Tonnel. Submit your transaction hash and track reward status.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "Tonnel",
    "TON airdrop",
    "Tokamak Network Token",
    "Tokamak Private App Channels",
    "private-state DApp",
    "the-great-first-channel",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: "Tonnel",
    images: [
      {
        url: "/tonnel-airdrop-poster.png",
        width: 1672,
        height: 941,
        alt: "TON AIRDROP ON TONNEL",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/tonnel-airdrop-poster.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: siteTitle,
    headline: siteTitle,
    description: siteDescription,
    url: siteUrl,
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: "Tonnel",
      url: siteUrl,
    },
    about: [
      {
        "@type": "Thing",
        name: "Tonnel",
        description:
          "The public name for the-great-first-channel, a dedicated Tokamak Private App Channel for the private-state DApp.",
      },
      {
        "@type": "SoftwareApplication",
        name: "private-state DApp",
        applicationCategory: "BlockchainApplication",
        operatingSystem: "Web",
        description:
          "A Tokamak Private App Channels DApp that turns TON into proof-backed confidential notes inside Tonnel.",
      },
    ],
    provider: {
      "@type": "Organization",
      name: "Tokamak Network",
      url: "https://www.tokamak.network/",
      sameAs: [
        "https://github.com/tokamak-network/Tokamak-zk-EVM-contracts",
        "https://t.me/tonnel_ethereum",
      ],
    },
    mainEntity: {
      "@type": "Offer",
      name: "25 TON per valid private-state transfer",
      description:
        "Participants submit a valid private-state transfer transaction hash from Tonnel to receive 25 TON, subject to verification, duplicate checks, remaining budget, and operational review.",
      url: siteUrl,
      category: "Airdrop",
    },
  };

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
