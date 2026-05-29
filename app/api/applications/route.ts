import { NextResponse } from "next/server";

import {
  countApplications,
  createApplication,
  hasSubmittedTransaction,
  listApplications,
} from "@/lib/applications";
import {
  reserveRegistrationSlot,
  rollbackRegistrationSlot,
} from "@/lib/rate-limit";
import { buildSubmissionMetadata } from "@/lib/submission-metadata";

export const runtime = "nodejs";
const publicPageSize = 10;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const requestedPage = Number(url.searchParams.get("page") ?? "1");
    const page = Number.isFinite(requestedPage)
      ? Math.max(Math.trunc(requestedPage), 1)
      : 1;
    const total = await countApplications();
    const totalPages = Math.max(Math.ceil(total / publicPageSize), 1);
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * publicPageSize;

    return NextResponse.json({
      applications: await listApplications(publicPageSize, offset),
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
  let registrationSlotReserved = false;

  try {
    const body = await request.json();
    const qualifyingTxHash = String(body.qualifyingTxHash ?? "");

    if (await hasSubmittedTransaction(qualifyingTxHash)) {
      const result = await createApplication({
        qualifyingTxHash,
        submitterMetadata: buildSubmissionMetadata(request),
      });

      return NextResponse.json(
        {
          application: result.application,
          created: result.created,
        },
        { status: result.created ? 201 : 200 },
      );
    }

    const limit = await reserveRegistrationSlot(request);

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: "Registration limit reached.",
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

    registrationSlotReserved = true;

    const result = await createApplication({
      qualifyingTxHash,
      submitterMetadata: buildSubmissionMetadata(request),
    });

    if (!result.created) {
      await rollbackRegistrationSlot(request);
      registrationSlotReserved = false;
    }

    return NextResponse.json(
      {
        application: result.application,
        created: result.created,
      },
      { status: result.created ? 201 : 200 },
    );
  } catch (error) {
    if (registrationSlotReserved) {
      await rollbackRegistrationSlot(request);
    }

    const message = error instanceof Error ? error.message : "Invalid application.";

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
