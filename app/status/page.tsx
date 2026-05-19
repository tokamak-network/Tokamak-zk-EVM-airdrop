import { AirdropApp } from "@/components/AirdropApp";
import {
  countApplications,
  listApplications,
} from "@/lib/applications";
import { getConfig } from "@/lib/config";
import { getEventState } from "@/lib/event-state";

export const dynamic = "force-dynamic";

export default function StatusPage() {
  const config = getConfig();
  const eventState = getEventState();

  return (
    <AirdropApp
      channel={config.channel}
      initialApplications={listApplications(10)}
      initialApplicationTotal={countApplications()}
      remainingBudgetTon={eventState?.remainingBudgetTon ?? null}
      rewardTon={config.rewardTon}
      totalBudgetTon={config.totalBudgetTon}
    />
  );
}
