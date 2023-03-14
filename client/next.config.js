/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true,
  eslint: {
    dirs: ['src'],
  },
  swcMinify: false,
  output: 'standalone',
  redirects() {
    return [
      {
        source: '/',
        destination: '/analysis/map',
        permanent: false,
      },
      {
        source: '/analysis',
        destination: '/analysis/map',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
