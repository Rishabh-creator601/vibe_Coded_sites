import { NextResponse, type NextRequest } from "next/server";

// Login-only pages. The API still checks auth itself; this just saves a round trip.
export function middleware(req: NextRequest) {
  if (req.cookies.has("token")) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(req.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/dashboard/:path*", "/settings/:path*", "/test/:path+"] };
