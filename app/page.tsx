import { AirdropApp } from "@/components/AirdropApp";
import {
  countApplications,
  listApplications,
} from "@/lib/applications";
import { getConfig } from "@/lib/config";
import { getEventState } from "@/lib/event-state";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const config = getConfig();
  const [eventState, applications, applicationTotal] = await Promise.all([
    getEventState(),
    listApplications(10),
    countApplications(),
  ]);

  return (
    <AirdropApp
      channel={config.channel}
      initialApplications={applications}
      initialApplicationTotal={applicationTotal}
      remainingBudgetTon={eventState?.remainingBudgetTon ?? null}
      rewardTon={config.rewardTon}
      totalBudgetTon={config.totalBudgetTon}
    />
  );
}
