import { NextResponse } from "next/server";

import { assertOperatorRequest, OperatorAuthError } from "@/lib/operator";
import { getSubmissionAnalytics } from "@/lib/submission-analytics";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    assertOperatorRequest(request);

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "5000");

    return NextResponse.json(await getSubmissionAnalytics(limit));
  } catch (error) {
    if (error instanceof OperatorAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed." },
      { status: 500 },
    );
  }
}
