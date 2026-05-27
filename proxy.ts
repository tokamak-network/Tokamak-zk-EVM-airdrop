import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();

  if (host === "tonnel.io" || host === "www.tonnel.io") {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.hostname = "airdrop.tonnel.io";
    url.port = "";

    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
