import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TON AIRDROP ON TONNEL",
  description:
    "Submit an L2 account and a valid private-state transaction in the Tonnel channel to receive TON rewards.",
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
