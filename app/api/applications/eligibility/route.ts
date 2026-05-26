import { NextResponse } from "next/server";

import { checkEligibility } from "@/lib/eligibility";
import { checkSubmitRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const limit = await checkSubmitRateLimit(request, "eligibility");

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: "Request limit reached.",
          retryAfterSeconds: limit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(limit.retryAfterSeconds),
          },
        },
      );
    }

    const body = await request.json();
    const result = await checkEligibility(String(body.qualifyingTxHash ?? ""));

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Eligibility check failed.";

    if (message.includes("UPSTASH_REDIS_REST")) {
      return NextResponse.json(
        { error: "Service is temporarily unavailable." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: message,
      },
      { status: 400 },
    );
  }
}
