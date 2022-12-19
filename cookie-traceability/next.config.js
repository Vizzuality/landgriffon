/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['src'],
  },
  reactStrictMode: true,
  swcMinify: true,
  webpack: function (config, { isServer }) {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
};

module.exports = nextConfig;
