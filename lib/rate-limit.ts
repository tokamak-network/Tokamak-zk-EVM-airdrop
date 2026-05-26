import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type LimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

type RateLimitScope = "eligibility" | "submit";

type MemoryBucket = {
  count: number;
  resetAt: number;
};

type UpstashEnv = {
  token: string;
  url: string;
};

const minuteLimit = 10;
const dayLimit = 7;
const memoryBuckets = new Map<string, MemoryBucket>();

const minuteLimiters = new Map<RateLimitScope, Ratelimit>();
const dayLimiters = new Map<RateLimitScope, Ratelimit>();
let redisClient: Redis | null = null;

export async function checkSubmitRateLimit(
  request: Request,
  scope: RateLimitScope = "submit",
): Promise<LimitResult> {
  const identifier = getClientIdentifier(request);

  if (hasUpstashEnv()) {
    const [minuteResult, dayResult] = await Promise.all([
      getMinuteLimiter(scope).limit(identifier),
      getDayLimiter(scope).limit(identifier),
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

  return checkMemoryRateLimit(`${scope}:${identifier}`);
}

function getMinuteLimiter(scope: RateLimitScope): Ratelimit {
  const existing = minuteLimiters.get(scope);

  if (existing) {
    return existing;
  }

  const limiter = new Ratelimit({
    redis: getRedisClient(),
    limiter: Ratelimit.slidingWindow(minuteLimit, "1 m"),
    prefix: `tonnel-airdrop:${scope}:minute`,
  });
  minuteLimiters.set(scope, limiter);

  return limiter;
}

function getDayLimiter(scope: RateLimitScope): Ratelimit {
  const existing = dayLimiters.get(scope);

  if (existing) {
    return existing;
  }

  const limiter = new Ratelimit({
    redis: getRedisClient(),
    limiter: Ratelimit.slidingWindow(dayLimit, "1 d"),
    prefix: `tonnel-airdrop:${scope}:day`,
  });
  dayLimiters.set(scope, limiter);

  return limiter;
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
