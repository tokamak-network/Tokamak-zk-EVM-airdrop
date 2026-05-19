import { NextResponse } from "next/server";

import { createApplication } from "@/lib/applications";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const application = createApplication({
      qualifyingTxHash: String(body.qualifyingTxHash ?? ""),
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid application.",
      },
      { status: 400 },
    );
  }
}
