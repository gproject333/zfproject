import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  transpilePackages: ["@smart-zuj/core"],
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
  devIndicators: false,
  // Self-hosted Coolify builds in a memory-constrained container with
  // no swap; the second `tsc` pass during `next build` would OOM-kill
  // the build container at exit code 255. We already validate types
  // separately (CI + the local `pnpm --filter @smart-zuj/web exec tsc
  // --noEmit` we run on every PR), so re-running it here is just
  // duplicate work in the wrong place.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
