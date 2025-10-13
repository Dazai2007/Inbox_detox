/** @type {import('next').NextConfig} */
const backend = process.env.NEXT_PUBLIC_API_URL

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  async rewrites() {
    if (!backend) return []
    return [
      // Generic API namespace
      { source: '/api/:path*', destination: `${backend}/api/:path*` },
      // Top-level analytics and emails routers used by the app
      { source: '/analytics/:path*', destination: `${backend}/analytics/:path*` },
      { source: '/emails/:path*', destination: `${backend}/emails/:path*` },
      // Health proxy for quick checks
      { source: '/health', destination: `${backend}/health` },
    ]
  }
}

export default nextConfig
