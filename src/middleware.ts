import { NextRequest, NextResponse } from "next/server";

const RESERVED = new Set(["login", "activate", "admin"]);

function buildUrl(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    url.host = forwardedHost;
    url.port = "";
    url.protocol =
      (request.headers.get("x-forwarded-proto") ?? "https") + ":";
  }
  url.pathname = pathname;
  return url;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/ticket/")) return NextResponse.next();

  const rest = pathname.slice("/ticket/".length);
  const slashIdx = rest.indexOf("/");
  const segment = slashIdx >= 0 ? rest.slice(0, slashIdx) : rest;
  const subPath = slashIdx >= 0 ? rest.slice(slashIdx) : "";

  if (!segment || RESERVED.has(segment)) return NextResponse.next();

  const slug = request.cookies.get("company_slug")?.value;

  /* /ticket/admin/* → redirect to /ticket/[slug]/* */
  if (segment === "admin") {
    /* Handled by RESERVED set above – kept for clarity */
    return NextResponse.next();
  }

  /* /ticket/[non-reserved]/* → rewrite internally to /ticket/admin/* */
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = `/ticket/admin${subPath}`;
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: "/ticket/:path+",
};
