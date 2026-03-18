import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@cpv/config', '@cpv/contracts'],
};

export default nextConfig;
