/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ['src'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/analysis',
        permanent: false,
      },
      {
        source: '/admin',
        destination: '/admin/data',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
