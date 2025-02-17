import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.worker.min.js': {
          loaders: ['raw-loader'],
          as: '*.js'
        }
      }
    }
  }
};

export default nextConfig;
