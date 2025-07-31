/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "build",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configure headers for rich sharing
  async headers() {
    return [
      {
        // Apply to all video pages for rich sharing
        source: "/video/:id*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ]
  },

  // Add rewrites to ensure video routes work properly
  async rewrites() {
    return [
      {
        source: "/video/:id",
        destination: "/video/:id",
      },
    ]
  },

  images: {
    domains: ["5mofstore.ams3.digitaloceanspaces.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "5mofstore.ams3.digitaloceanspaces.com",
        port: "",
        pathname: "/profile-pictures/**",
      },
      {
        protocol: "https",
        hostname: "5mofstore.ams3.digitaloceanspaces.com",
        port: "",
        pathname: "/videos/**",
      },
    ],
    unoptimized: true,
  },
}

module.exports = nextConfig
