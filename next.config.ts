import type { NextConfig } from "next";
import { LEGACY_REDIRECTS } from "./src/lib/redirects";

const isDev = process.env.NODE_ENV !== "production";

/**
 * CSP sem nonces para as páginas continuarem estáticas: 'unsafe-inline' em script-src
 * cobre os scripts inline do Next, o consent-defaults do GTM e o JSON-LD.
 * 'unsafe-eval' só em desenvolvimento (React/Turbopack).
 */
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io https://www.googletagmanager.com https://*.google-analytics.com",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://challenges.cloudflare.com https://*.sentry.io",
  "frame-src https://challenges.cloudflare.com https://www.googletagmanager.com",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

/** O Sanity Studio precisa de websocket, avatares do Google e eval. */
const STUDIO_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io https://*.sanity.io https://lh3.googleusercontent.com",
  "connect-src 'self' https://*.sanity.io wss://*.sanity.io",
  "font-src 'self' data: https://*.sanity.io",
  "frame-src 'self' https://*.sanity.io",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const COMMON_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" }],
  },
  async redirects() {
    return LEGACY_REDIRECTS;
  },
  async headers() {
    return [
      { source: "/:path*", headers: COMMON_HEADERS },
      // Global exclui /studio (negative lookahead): assim nenhuma ordem de merge importa.
      {
        source: "/((?!studio(?:/|$)).*)",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        source: "/studio/:path*",
        headers: [
          { key: "Content-Security-Policy", value: STUDIO_CSP },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
