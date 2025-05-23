// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     distDir: 'build',
// };

// module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "build",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
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
    ],
    unoptimized: true,
  },
}

module.exports = nextConfig
