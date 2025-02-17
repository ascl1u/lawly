import type { NextConfig } from "next";
import path from 'path';
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
  },
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@': path.join(process.cwd(), 'src'),
      },
      extensionAlias: {
        '.js': ['.js', '.ts', '.tsx']
      }
    }
    return config
  }
};

export default nextConfig;
