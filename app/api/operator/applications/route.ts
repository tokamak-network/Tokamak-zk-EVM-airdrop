import { NextResponse } from "next/server";

import { listApplications } from "@/lib/applications";
import { assertOperatorRequest, OperatorAuthError } from "@/lib/operator";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    assertOperatorRequest(request);

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "100");

    return NextResponse.json({
      applications: listApplications(limit),
    });
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
