import { NextResponse } from "next/server";

import {
  countApplications,
  createApplication,
  listApplications,
} from "@/lib/applications";
import { checkSubmitRateLimit } from "@/lib/rate-limit";

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
    const limit = await checkSubmitRateLimit(request);

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(limit.retryAfterSeconds),
          },
        },
      );
    }

    const body = await request.json();
    const result = createApplication({
      qualifyingTxHash: String(body.qualifyingTxHash ?? ""),
    });

    return NextResponse.json(
      {
        application: result.application,
        created: result.created,
      },
      { status: result.created ? 201 : 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid application.";

    if (message.includes("UPSTASH_REDIS_REST")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }

    return NextResponse.json(
      {
        error: message,
      },
      { status: 400 },
    );
  }
}
