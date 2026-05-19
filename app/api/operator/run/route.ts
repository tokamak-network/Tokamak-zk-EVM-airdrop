import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Payout worker execution is local-only. Run npm run worker on the operator MacBook.",
    },
    { status: 410 },
  );
}
