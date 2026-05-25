import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type LimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

type MemoryBucket = {
  count: number;
  resetAt: number;
};

type UpstashEnv = {
  token: string;
  url: string;
};

const minuteLimit = 10;
const dayLimit = 10;
const memoryBuckets = new Map<string, MemoryBucket>();

let minuteLimiter: Ratelimit | null = null;
let dayLimiter: Ratelimit | null = null;
let redisClient: Redis | null = null;

export async function checkSubmitRateLimit(
  request: Request,
): Promise<LimitResult> {
  const identifier = getClientIdentifier(request);

  if (hasUpstashEnv()) {
    const [minuteResult, dayResult] = await Promise.all([
      getMinuteLimiter().limit(identifier),
      getDayLimiter().limit(identifier),
    ]);
    const result = minuteResult.success ? dayResult : minuteResult;

    return {
      allowed: result.success,
      retryAfterSeconds: result.success
        ? 0
        : Math.max(Math.ceil((result.reset - Date.now()) / 1000), 1),
    };
  }

  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required for submit rate limiting in production.",
    );
  }

  return checkMemoryRateLimit(identifier);
}

function getMinuteLimiter(): Ratelimit {
  if (!minuteLimiter) {
    minuteLimiter = new Ratelimit({
      redis: getRedisClient(),
      limiter: Ratelimit.slidingWindow(minuteLimit, "1 m"),
      prefix: "tonnel-airdrop:submit:minute",
    });
  }

  return minuteLimiter;
}

function getDayLimiter(): Ratelimit {
  if (!dayLimiter) {
    dayLimiter = new Ratelimit({
      redis: getRedisClient(),
      limiter: Ratelimit.slidingWindow(dayLimit, "1 d"),
      prefix: "tonnel-airdrop:submit:day",
    });
  }

  return dayLimiter;
}

function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();
  const ip =
    forwardedIp ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown";

  return `ip:${ip}`;
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

function checkMemoryRateLimit(identifier: string): LimitResult {
  const minuteResult = hitMemoryBucket(`${identifier}:minute`, minuteLimit, 60);
  const dayResult = hitMemoryBucket(`${identifier}:day`, dayLimit, 24 * 60 * 60);

  if (!minuteResult.allowed) {
    return minuteResult;
  }

  return dayResult;
}

function hitMemoryBucket(
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
