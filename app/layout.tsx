import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TON AIRDROP ON TONNEL",
  description:
    "Submit a valid private-state transaction from a Tonnel participant account to receive TON rewards.",
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
