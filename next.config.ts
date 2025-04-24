import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  images: {
    domains: [
      "m.media-amazon.com",
      "lh3.googleusercontent.com",
      "platform-lookaside.fbsbx.com",
      "localhost",
      "res.cloudinary.com",
      "booki-hazel.vercel.app",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "booki-hazel.vercel.app",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET" },
        ],
      },
      {
        source: "/invoices/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET" },
          { key: "Content-Type", value: "text/html" },
        ],
      },
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
}

export default withNextIntl(nextConfig)