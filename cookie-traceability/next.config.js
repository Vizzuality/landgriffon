/** @type {import('next').NextConfig} */

const nextConfig = {
  basePath: '/where-does-my-cookie-come-from',
  eslint: {
    dirs: ['src'],
  },
  reactStrictMode: false,
  swcMinify: true,
  webpack: function (config, { isServer }) {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };

    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader', 'glslify-loader'],
    });

    return config;
  },
};

module.exports = nextConfig;
