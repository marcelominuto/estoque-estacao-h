import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Avoid generating framework instruction files during development.
  agentRules: false,
};

export default nextConfig;
