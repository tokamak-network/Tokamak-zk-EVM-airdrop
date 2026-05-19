import { AirdropApp } from "@/components/AirdropApp";
import { getConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export default function StatusPage() {
  const config = getConfig();

  return (
    <AirdropApp
      channel={config.channel}
      rewardTon={config.rewardTon}
      totalBudgetTon={config.totalBudgetTon}
      initialPanel="status"
    />
  );
}
