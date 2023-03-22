/** @type {import('next').NextConfig} */
const nextConfig = {
  // ! the current approach we follow to handle layers on the map does not work with strict mode enabled,
  // ! do not enable it unless you know what you are doing or know the issue is fixed.
  reactStrictMode: false,
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
