import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: every route is pre-rendered at build time → client-side
  // navigation has no RSC roundtrip. Output goes to `out/`.
  output: "export",
  reactStrictMode: true,
  images: {
    // next/image's optimizer is a server feature; static export needs raw <img> behaviour.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // NOTE: `headers()` does not run with `output: "export"`. Configure the
  // sw.js Cache-Control header at the host level (vercel.json, _headers,
  // CDN rule, etc.) so service worker updates are picked up reliably.
  turbopack: {},
};

export default nextConfig;