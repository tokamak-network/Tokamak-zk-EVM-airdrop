import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tokamak Private-State Airdrop",
  description: "Submit a qualifying private-state transfer and track payout status.",
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
