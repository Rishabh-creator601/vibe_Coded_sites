import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // The shared package ships TypeScript source, so Next compiles it.
  transpilePackages: ["@saffron/shared"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // PLAN.md section 5: the browser calls /api/v1/* on this domain and Next forwards
  // it to the Express API, so auth cookies stay first-party and there's no CORS.
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${process.env.API_URL ?? "http://localhost:4000"}/api/v1/:path*` }];
  },
};

export default withNextIntl(nextConfig);
