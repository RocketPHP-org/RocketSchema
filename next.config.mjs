/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Watch data directory for changes in development
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules', '**/.git'],
      };
    }
    return config;
  },
};

export default nextConfig;
