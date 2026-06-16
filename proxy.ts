import { NextResponse, type NextRequest } from "next/server";

const crawlerPatterns = [
  ["GPTBot", /\bGPTBot\b/i],
  ["OAI-SearchBot", /\bOAI-SearchBot\b/i],
  ["ClaudeBot", /\bClaudeBot\b/i],
  ["Claude-SearchBot", /\bClaude-SearchBot\b/i],
  ["PerplexityBot", /\bPerplexityBot\b/i],
  ["CCBot", /\bCCBot\b/i],
  ["Googlebot", /\bGooglebot\b/i],
  ["Bingbot", /\bbingbot\b/i],
] as const;

const tonigmaAirdropHosts = new Set([
  "airdrop.tonnel.io",
  "tonnel.io",
  "www.tonnel.io",
]);
const tonigmaObserverHosts = new Set(["tonigma.network", "www.tonigma.network"]);

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();
  const knownCrawler = getKnownCrawler(request.headers.get("user-agent"));

  if (knownCrawler) {
    console.log(
      JSON.stringify({
        level: "info",
        msg: "crawler-access",
        crawler: knownCrawler,
        host,
        path: request.nextUrl.pathname,
        xVercelId: request.headers.get("x-vercel-id"),
      }),
    );
  }

  if (host && tonigmaAirdropHosts.has(host)) {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.hostname = "airdrop.tonigma.network";
    url.port = "";

    return NextResponse.redirect(url, 308);
  }

  if (host && tonigmaObserverHosts.has(host)) {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.hostname = "observer.tonigma.network";
    url.port = "";

    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

function getKnownCrawler(userAgent: string | null): string | null {
  if (!userAgent) {
    return null;
  }

  return (
    crawlerPatterns.find(([, pattern]) => pattern.test(userAgent))?.[0] ?? null
  );
}

export const config = {
  matcher: "/:path*",
};
