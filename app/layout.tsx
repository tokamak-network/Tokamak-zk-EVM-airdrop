import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { faqItems, siteDescription, siteTitle, siteUrl } from "@/lib/site-content";
import "./globals.css";

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
  const webPageJsonLd = {
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
  const faqPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([webPageJsonLd, faqPageJsonLd]),
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
