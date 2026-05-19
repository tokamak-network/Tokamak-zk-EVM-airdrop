import { AirdropApp } from "@/components/AirdropApp";
import { countTransferredApplications } from "@/lib/applications";
import { getConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const config = getConfig();
  const remainingBudgetTon = Math.max(
    config.totalBudgetTon - countTransferredApplications() * config.rewardTon,
    0,
  );

  return (
    <AirdropApp
      channel={config.channel}
      remainingBudgetTon={remainingBudgetTon}
      rewardTon={config.rewardTon}
      totalBudgetTon={config.totalBudgetTon}
    />
  );
}
