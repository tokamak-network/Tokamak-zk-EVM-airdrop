import { AirdropApp } from "@/components/AirdropApp";
import { getConfig } from "@/lib/config";

export default function HomePage() {
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
