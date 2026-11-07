import path from 'node:path';
import { fileURLToPath } from 'node:url';

const API_URL = process.env.API_URL || 'http://127.0.0.1:4000';
// npm workspaces install to the folder above this one.
const workspaceRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: { root: workspaceRoot },
  outputFileTracingRoot: workspaceRoot,
  images: { qualities: [75, 85] },
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
