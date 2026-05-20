import { NextResponse } from "next/server";

import { findApplication } from "@/lib/applications";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query") ?? "";
  const application = await findApplication(query);

  if (!application) {
    return NextResponse.json({ application: null }, { status: 404 });
  }

  return NextResponse.json({ application });
}
