import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Picks the language from the saved cookie, then Accept-Language, then English,
// and redirects "/" to "/en" (or the visitor's language).
export default createMiddleware(routing);

export const config = {
  // Skip API calls, Next internals and files with an extension (images, icons).
  matcher: "/((?!api|_next|_vercel|.*\..*).*)",
};
