import type { NextConfig } from "next";

const apiProxyTarget = process.env.API_PROXY_TARGET?.trim().replace(/\/+$/, "");
const publicApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

function validateHttpsApiUrl(name: string, value: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be an absolute URL.`);
  }

  if (url.protocol !== "https:") {
    throw new Error(`${name} must use HTTPS in production.`);
  }

  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    throw new Error(`${name} cannot point to localhost in production.`);
  }
}

const isHostedBuild = process.env.VERCEL === "1" || process.env.NETLIFY === "true";

if (isHostedBuild) {
  if (apiProxyTarget) {
    validateHttpsApiUrl("API_PROXY_TARGET", apiProxyTarget);

    if (publicApiUrl && publicApiUrl !== "/api" && publicApiUrl !== "/api/") {
      throw new Error(
        "Unset NEXT_PUBLIC_API_URL (or set it to /api) when API_PROXY_TARGET is used.",
      );
    }
  } else if (publicApiUrl) {
    validateHttpsApiUrl("NEXT_PUBLIC_API_URL", publicApiUrl);
  } else {
    throw new Error(
      "Set API_PROXY_TARGET in the hosting provider, or provide an HTTPS NEXT_PUBLIC_API_URL.",
    );
  }
}

const nextConfig: NextConfig = {
  // Keep Turbopack scoped to this application. Without this, the lockfile in
  // the user directory can be selected as the workspace root, preventing CSS
  // imports from resolving packages installed in this project.
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    if (!apiProxyTarget) return [];

    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
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
