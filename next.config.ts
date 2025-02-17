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
  },
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@': './src',
      },
      extensionAlias: {
        '.js': ['.js', '.ts', '.tsx']
      }
    }
    return config
  }
};

export default nextConfig;
