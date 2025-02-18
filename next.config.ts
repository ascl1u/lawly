import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@': path.join(__dirname, 'src').replace(/\\/g, '/'),
      }
    }
    return config
  }
};

export default nextConfig;
