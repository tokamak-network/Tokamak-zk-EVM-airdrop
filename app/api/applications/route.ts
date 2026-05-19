import { NextResponse } from "next/server";

import {
  countApplications,
  createApplication,
  listApplications,
} from "@/lib/applications";

export const runtime = "nodejs";
const publicPageSize = 10;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const requestedPage = Number(url.searchParams.get("page") ?? "1");
    const page = Number.isFinite(requestedPage)
      ? Math.max(Math.trunc(requestedPage), 1)
      : 1;
    const total = countApplications();
    const totalPages = Math.max(Math.ceil(total / publicPageSize), 1);
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * publicPageSize;

    return NextResponse.json({
      applications: listApplications(publicPageSize, offset),
      page: safePage,
      pageSize: publicPageSize,
      total,
      totalPages,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed." },
      { status: 500 },
    );
  }
}

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
