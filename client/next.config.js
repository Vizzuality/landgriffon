/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */
const withPlugins = require('next-compose-plugins');
const withAntdLess = require('next-plugin-antd-less');

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ['src'],
  },
  webpack: (config) => {
    config.node = {
      fs: 'empty',
    };

    return config;
  },
};

module.exports = withPlugins(
  [
    // Used to customize Andt components
    withAntdLess({
      lessVarsFilePath: './src/styles/antd.less',
    }),
  ],
  nextConfig,
);
