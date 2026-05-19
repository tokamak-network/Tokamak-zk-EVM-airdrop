import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TON AIRDROP ON TONNEL",
  description:
    "Make a valid private-state transfer on Tonnel, submit the transaction hash, and earn 25 TON.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
