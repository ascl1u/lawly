import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // experimental: {
  //   turbo: {
  //     rules: {
  //       '*.worker.min.js': {
  //         loaders: ['raw-loader'],
  //         as: '*.js'
  //       }
  //     }
  //   }
  // },
  webpack: (config) => {
    // Preserve the existing aliases
    const existingAlias = config.resolve?.alias || {};
    
    config.resolve = {
      ...config.resolve,
      alias: {
        ...existingAlias,
        '@': path.join(process.cwd(), './src'),
      },
      // Ensure case sensitivity is enforced
      symlinks: false
    }
    return config
  }
};

export default nextConfig;
