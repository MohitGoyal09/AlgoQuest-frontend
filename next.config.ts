import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for Docker production builds
  output: "standalone",

  // Fix turbopack workspace root detection (parent dirs have stray package.json)
  turbopack: {
    root: ".",
  },

  // Security: remove X-Powered-By header
  poweredByHeader: false,

  // Strict mode for catching common React bugs
  reactStrictMode: true,

  // Image optimization domains (add remote domains as needed)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
