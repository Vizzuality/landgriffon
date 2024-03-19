/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // ! the current approach we follow to handle layers on the map does not work with strict mode enabled,
  // ! do not enable it unless you know what you are doing or know the issue is fixed.
  reactStrictMode: false,
  redirects() {
    return [
      {
        source: '/',
        destination: '/eurd',
        permanent: false,
      },
      {
        source: '/analysis',
        destination: '/eudr',
        permanent: false,
      },
      {
        source: '/analysis/:id',
        destination: '/eudr',
        permanent: false,
      },
      {
        source: '/data',
        destination: '/eurd',
        permanent: false,
      },
      {
        source: '/auth/signup',
        destination: '/auth/signin',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
