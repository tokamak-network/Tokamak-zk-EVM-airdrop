import { NextResponse } from "next/server";

import { assertOperatorRequest, OperatorAuthError } from "@/lib/operator";
import { runAirdropWorker } from "@/lib/worker";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertOperatorRequest(request);
    const summary = await runAirdropWorker();

    return NextResponse.json({ summary });
  } catch (error) {
    if (error instanceof OperatorAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Worker failed." },
      { status: 500 },
    );
  }
}
