import type { Metadata } from "next";
import { AirdropApp } from "@/components/AirdropApp";
import { getConfig } from "@/lib/config";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default function StatusPage() {
  const config = getConfig();

  return (
    <AirdropApp
      channel={config.channel}
      initialApplications={[]}
      initialApplicationTotal={0}
      initialRemainingBudgetTon={null}
      rewardTon={config.rewardTon}
      totalBudgetTon={config.totalBudgetTon}
    />
  );
}
