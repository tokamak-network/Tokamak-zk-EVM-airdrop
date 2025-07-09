import React from "react";
import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { Jersey_10 } from "next/font/google";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
});

const jersey10 = Jersey_10({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jersey-10",
});

export const metadata: Metadata = {
  title: "Tokamak ZK-EVM Airdrop",
  description:
    "Participate in the Tokamak ZK-EVM airdrop event and claim your tokens",
  keywords: ["Tokamak", "ZK-EVM", "Airdrop", "Blockchain", "Ethereum"],
  authors: [{ name: "Tokamak Network" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${ibmPlexMono.variable} ${jersey10.variable} bg-gray-50 text-gray-900 antialiased`}
      >
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
