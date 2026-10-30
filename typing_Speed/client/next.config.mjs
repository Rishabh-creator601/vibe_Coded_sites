/** @type {import('next').NextConfig} */
const nextConfig = {
  // lets the client import ../shared (scoring engine + level config)
  experimental: { externalDir: true },
};

export default nextConfig;
