import { NextResponse, type NextRequest } from "next/server";

// Login-only pages. The API still checks auth itself; this just saves a round trip.
// Only works when the API shares the site's cookies (local dev). When the API lives on another
// domain the `token` cookie is invisible here, so the client-side <RequireLogin> guard does the job.
const sharesCookies = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").includes("localhost");

export function middleware(req: NextRequest) {
  if (!sharesCookies || req.cookies.has("token")) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(req.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/dashboard/:path*", "/settings/:path*", "/test/:path+"] };
