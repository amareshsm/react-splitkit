import { createMDX } from 'fumadocs-mdx/next';
import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Alias react-splitkit to the local library source so no build step is needed
  webpack(config) {
    config.resolve.alias['react-splitkit'] = path.resolve(process.cwd(), '../src/index.ts');
    return config;
  },
};

const withMDX = createMDX();
export default withMDX(nextConfig);
