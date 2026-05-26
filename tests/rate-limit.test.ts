import assert from "node:assert/strict";
import test from "node:test";

import { checkSubmitRateLimit } from "@/lib/rate-limit";

test("checkSubmitRateLimit blocks the eighth submit attempt in one day", async () => {
  const request = new Request("https://example.test/api/applications", {
    headers: {
      "x-forwarded-for": "203.0.113.11",
    },
  });

  for (let index = 0; index < 7; index += 1) {
    const result = await checkSubmitRateLimit(request);

    assert.equal(result.allowed, true);
  }

  const blocked = await checkSubmitRateLimit(request);

  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds > 0);
});

test("checkSubmitRateLimit keeps eligibility and submit buckets separate", async () => {
  const request = new Request("https://example.test/api/applications", {
    headers: {
      "x-forwarded-for": "203.0.113.13",
    },
  });

  for (let index = 0; index < 7; index += 1) {
    const result = await checkSubmitRateLimit(request, "eligibility");

    assert.equal(result.allowed, true);
  }

  for (let index = 0; index < 7; index += 1) {
    const result = await checkSubmitRateLimit(request);

    assert.equal(result.allowed, true);
  }

  const blocked = await checkSubmitRateLimit(request);

  assert.equal(blocked.allowed, false);
});

test("checkSubmitRateLimit fails closed in production without Upstash env", async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousVercel = process.env.VERCEL;
  const previousUrl = process.env.UPSTASH_REDIS_REST_URL;
  const previousToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const previousPrefixedUrl =
    process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
  const previousPrefixedToken =
    process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;

  Reflect.set(process.env, "NODE_ENV", "production");
  delete process.env.VERCEL;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
  delete process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;

  try {
    await assert.rejects(
      () =>
        checkSubmitRateLimit(
          new Request("https://example.test/api/applications", {
            headers: {
              "x-forwarded-for": "203.0.113.12",
            },
          }),
        ),
      /UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN/,
    );
  } finally {
    restoreEnv("NODE_ENV", previousNodeEnv);
    restoreEnv("VERCEL", previousVercel);
    restoreEnv("UPSTASH_REDIS_REST_URL", previousUrl);
    restoreEnv("UPSTASH_REDIS_REST_TOKEN", previousToken);
    restoreEnv(
      "UPSTASH_REDIS_REST_KV_REST_API_URL",
      previousPrefixedUrl,
    );
    restoreEnv(
      "UPSTASH_REDIS_REST_KV_REST_API_TOKEN",
      previousPrefixedToken,
    );
  }
});

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  Reflect.set(process.env, name, value);
}
