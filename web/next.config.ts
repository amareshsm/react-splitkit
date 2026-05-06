import { createMDX } from 'fumadocs-mdx/next';
import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Tell Next.js the workspace root is one level up (monorepo with npm workspaces).
  outputFileTracingRoot: path.resolve(__dirname, '..'),
  eslint: {
    // ESLint runs on the library via the root package's lint script.
    // The web app has no standalone ESLint config.
    ignoreDuringBuilds: true,
  },
};

const withMDX = createMDX();
export default withMDX(nextConfig);
