/** @type {import('next').NextConfig} */
import path from "node:path";

const nextConfig = {
  outputFileTracingRoot: path.join(import.meta.dirname, ".."),
  // lets the client import ../shared (scoring engine + level config)
  experimental: { externalDir: true },
};

export default nextConfig;
