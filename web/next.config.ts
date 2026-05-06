import { createMDX } from 'fumadocs-mdx/next';
import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Alias react-splitkit to the local library source so no build step is needed
  webpack(config) {
    config.resolve.alias['react-splitkit'] = path.resolve(process.cwd(), '../src/index.ts');
    // When webpack compiles ../src/* files it walks up from that directory to find
    // node_modules, missing web/node_modules entirely on Vercel (root node_modules
    // is never installed there). Pinning web/node_modules first fixes the lookup.
    config.resolve.modules = [
      path.resolve(process.cwd(), 'node_modules'),
      'node_modules',
    ];
    return config;
  },
};

const withMDX = createMDX();
export default withMDX(nextConfig);
