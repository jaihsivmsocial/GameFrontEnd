/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "build",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configure headers for rich sharing across all platforms
  async headers() {
    return [
      {
        // Apply to all video pages for rich sharing
        source: "/video/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Allow embedding for all major platforms
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://*.facebook.com https://*.twitter.com https://*.discord.com https://*.whatsapp.com https://*.slack.com https://*.linkedin.com https://*.telegram.org https://*.reddit.com;",
          },
        ],
      },
      {
        // Player pages - allow all embedding for rich previews
        source: "/video/:id/player",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600",
          },
        ],
      },
      {
        // API routes for metadata
        source: "/api/videos/:id/metadata",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, s-maxage=3600",
          },
        ],
      },
      {
        // oEmbed endpoint
        source: "/api/oembed",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ]
  },

  images: {
    domains: ["mstribe-website.s3.eu-north-1.amazonaws.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mstribe-website.s3.eu-north-1.amazonaws.com",
        port: "",
        pathname: "/profile-pictures/**",
      },
      {
        protocol: "https",
        hostname: "mstribe-website.s3.eu-north-1.amazonaws.com",
        port: "",
        pathname: "/videos/**",
      },
    ],
    unoptimized: true,
  },

  // Redirects for better SEO
  async redirects() {
    return [
      {
        source: "/clip/:id",
        destination: "/video/:id",
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
