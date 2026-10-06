import type { NextConfig } from "next";

// Allow next/image to optimise featured images served by the WordPress host.
const wpHost = (() => {
  try {
    return process.env.WORDPRESS_URL ? new URL(process.env.WORDPRESS_URL).hostname : null;
  } catch {
    return null;
  }
})();

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: wpHost
      ? [
          { protocol: "https", hostname: wpHost },
          { protocol: "https", hostname: "i0.wp.com" },
          { protocol: "https", hostname: "i1.wp.com" },
          { protocol: "https", hostname: "i2.wp.com" },
        ]
      : [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // The old site was a single index.html; keep old links working.
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/blog", destination: "/research", permanent: true },
      { source: "/blog/:slug", destination: "/research/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
