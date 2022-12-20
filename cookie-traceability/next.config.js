/** @type {import('next').NextConfig} */
const withTM = require('next-transpile-modules')(['@flowmap.gl/layers', '@flowmap.gl/data']);

const nextConfig = {
  eslint: {
    dirs: ['src'],
  },
  reactStrictMode: true,
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

module.exports = withTM(nextConfig);
