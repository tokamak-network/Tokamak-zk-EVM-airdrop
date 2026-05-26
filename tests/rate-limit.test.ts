import assert from "node:assert/strict";
import test from "node:test";

import {
  checkSubmissionRateLimit,
  reserveRegistrationSlot,
  rollbackRegistrationSlot,
} from "@/lib/rate-limit";

test("checkSubmissionRateLimit blocks the eleventh submit attempt in one minute", async () => {
  const request = new Request("https://example.test/api/applications", {
    headers: {
      "x-forwarded-for": "203.0.113.11",
    },
  });

  for (let index = 0; index < 10; index += 1) {
    const result = await checkSubmissionRateLimit(request);

    assert.equal(result.allowed, true);
  }

  const blocked = await checkSubmissionRateLimit(request);

  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds > 0);
  assert.ok(blocked.retryAfterSeconds <= 60);
});

test("reserveRegistrationSlot blocks the eighth registration in one day", async () => {
  const request = new Request("https://example.test/api/applications", {
    headers: {
      "x-forwarded-for": "203.0.113.12",
    },
  });

  for (let index = 0; index < 7; index += 1) {
    const result = await reserveRegistrationSlot(request);

    assert.equal(result.allowed, true);
  }

  const blocked = await reserveRegistrationSlot(request);

  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds > 0);
});

test("rollbackRegistrationSlot releases a reserved registration slot", async () => {
  const request = new Request("https://example.test/api/applications", {
    headers: {
      "x-forwarded-for": "203.0.113.13",
    },
  });

  for (let index = 0; index < 7; index += 1) {
    const result = await reserveRegistrationSlot(request);

    assert.equal(result.allowed, true);
    await rollbackRegistrationSlot(request);
  }

  for (let index = 0; index < 7; index += 1) {
    const result = await reserveRegistrationSlot(request);

    assert.equal(result.allowed, true);
  }

  const blocked = await reserveRegistrationSlot(request);

  assert.equal(blocked.allowed, false);
});

test("submission and registration counters are independent", async () => {
  const request = new Request("https://example.test/api/applications", {
    headers: {
      "x-forwarded-for": "203.0.113.14",
    },
  });

  for (let index = 0; index < 10; index += 1) {
    const result = await checkSubmissionRateLimit(request);

    assert.equal(result.allowed, true);
  }

  assert.equal((await checkSubmissionRateLimit(request)).allowed, false);
  assert.equal((await reserveRegistrationSlot(request)).allowed, true);
});

test("rate limit checks fail closed in production without Upstash env", async () => {
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
        checkSubmissionRateLimit(
          new Request("https://example.test/api/applications", {
            headers: {
              "x-forwarded-for": "203.0.113.15",
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
