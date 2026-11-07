const API_URL = process.env.API_URL || 'http://localhost:5100';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The browser only talks to this site, so login cookies stay first-party.
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${API_URL}/api/:path*` },
      { source: '/uploads/:path*', destination: `${API_URL}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
