import type { NextConfig } from "next";

// Keep in sync with AUTH_ENABLED in src/config/site.ts.
const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";

const nextConfig: NextConfig = {
  async redirects() {
    if (authEnabled) return [];
    return ["/login", "/register", "/forgot-password"].map((source) => ({
      source,
      destination: "/dashboard",
      permanent: false,
    }));
  },
};

export default nextConfig;
