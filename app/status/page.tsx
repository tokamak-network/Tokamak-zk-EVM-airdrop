import type { Metadata } from "next";
import { AirdropApp } from "@/components/AirdropApp";
import {
  countApplications,
  listApplications,
} from "@/lib/applications";
import { getConfig } from "@/lib/config";
import { getEventState } from "@/lib/event-state";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default async function StatusPage() {
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
