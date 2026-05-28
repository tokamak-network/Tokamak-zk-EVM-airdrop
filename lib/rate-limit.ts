import { Redis } from "@upstash/redis";

import { getCanonicalClientIp } from "@/lib/client-ip";

type LimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

type CounterScope = "registration" | "submission";

type MemoryBucket = {
  count: number;
  resetAt: number;
};

type UpstashEnv = {
  token: string;
  url: string;
};

const submissionMinuteLimit = 10;
const registrationDayLimit = 7;
const oneMinuteSeconds = 60;
const oneDaySeconds = 24 * 60 * 60;
const memoryBuckets = new Map<string, MemoryBucket>();

let redisClient: Redis | null = null;

export async function checkSubmissionRateLimit(
  request: Request,
): Promise<LimitResult> {
  const identifier = getClientIdentifier(request);

  return hitCounter(
    "submission",
    identifier,
    submissionMinuteLimit,
    oneMinuteSeconds,
  );
}

export async function reserveRegistrationSlot(
  request: Request,
): Promise<LimitResult> {
  const identifier = getClientIdentifier(request);
  const now = new Date(Date.now());

  return hitCounter(
    "registration",
    `${identifier}:utc-day:${formatUtcDate(now)}`,
    registrationDayLimit,
    getSecondsUntilNextUtcDay(now),
  );
}

export async function rollbackRegistrationSlot(request: Request): Promise<void> {
  const identifier = getClientIdentifier(request);
  const now = new Date(Date.now());
  const registrationKey = buildCounterKey(
    "registration",
    `${identifier}:utc-day:${formatUtcDate(now)}`,
  );

  if (hasUpstashEnv()) {
    await rollbackRedisCounter(registrationKey);
    return;
  }

  if (shouldFailClosedWithoutRedis()) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required for rate limiting in production.",
    );
  }

  rollbackMemoryCounter(registrationKey);
}

async function hitCounter(
  scope: CounterScope,
  identifier: string,
  limit: number,
  windowSeconds: number,
): Promise<LimitResult> {
  const key = buildCounterKey(scope, identifier);

  if (hasUpstashEnv()) {
    return hitRedisCounter(key, limit, windowSeconds);
  }

  if (shouldFailClosedWithoutRedis()) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required for rate limiting in production.",
    );
  }

  return hitMemoryCounter(key, limit, windowSeconds);
}

async function hitRedisCounter(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<LimitResult> {
  const result = await getRedisClient().eval<string[], [number, number]>(
    `
      local key = KEYS[1]
      local limit = tonumber(ARGV[1])
      local ttl = tonumber(ARGV[2])
      local current = tonumber(redis.call("GET", key) or "0")

      if current >= limit then
        local remaining = redis.call("TTL", key)

        if remaining < 1 then
          remaining = ttl
        end

        return {0, remaining}
      end

      current = redis.call("INCR", key)

      if current == 1 then
        redis.call("EXPIRE", key, ttl)
      end

      local remaining = redis.call("TTL", key)

      if remaining < 1 then
        remaining = ttl
      end

      return {1, remaining}
    `,
    [key],
    [String(limit), String(windowSeconds)],
  );

  return {
    allowed: result[0] === 1,
    retryAfterSeconds: result[0] === 1 ? 0 : Math.max(Math.ceil(result[1]), 1),
  };
}

async function rollbackRedisCounter(key: string): Promise<void> {
  await getRedisClient().eval<[], number>(
    `
      local key = KEYS[1]
      local current = tonumber(redis.call("GET", key) or "0")

      if current <= 1 then
        redis.call("DEL", key)
        return 0
      end

      return redis.call("DECR", key)
    `,
    [key],
    [],
  );
}

function hitMemoryCounter(
  key: string,
  limit: number,
  windowSeconds: number,
): LimitResult {
  const now = Date.now();
  const existing = memoryBuckets.get(key);

  if (!existing || existing.resetAt <= now) {
    memoryBuckets.set(key, {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    });

    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        Math.ceil((existing.resetAt - now) / 1000),
        1,
      ),
    };
  }

  existing.count += 1;

  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
}

function rollbackMemoryCounter(key: string): void {
  const existing = memoryBuckets.get(key);

  if (!existing) {
    return;
  }

  if (existing.count <= 1) {
    memoryBuckets.delete(key);
    return;
  }

  existing.count -= 1;
}

function buildCounterKey(scope: CounterScope, identifier: string): string {
  return `tonnel-airdrop:${scope}:${identifier}`;
}

function getClientIdentifier(request: Request): string {
  const ip = getCanonicalClientIp(request) ?? "unknown";

  return `ip:${ip}`;
}

function formatUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getSecondsUntilNextUtcDay(date: Date): number {
  const nextUtcDay = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + 1,
  );

  return Math.max(Math.ceil((nextUtcDay - date.getTime()) / 1000), 1);
}

function shouldFailClosedWithoutRedis(): boolean {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

function hasUpstashEnv(): boolean {
  return Boolean(getUpstashEnv());
}

function getRedisClient(): Redis {
  const env = getUpstashEnv();

  if (!env) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required.",
    );
  }

  if (!redisClient) {
    redisClient = new Redis({
      url: env.url,
      token: env.token,
    });
  }

  return redisClient;
}

function getUpstashEnv(): UpstashEnv | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;

  if (!url || !token) {
    return null;
  }

  return { token, url };
}
