import { fileURLToPath } from 'node:url';

import createJiti from 'jiti';

import { env } from './src/env.mjs';

const jiti = createJiti(fileURLToPath(import.meta.url));
jiti('./src/env.mjs');

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
        destination: '/analysis/map',
        permanent: false,
      },
      {
        source: '/analysis',
        destination: '/analysis/map',
        permanent: false,
      },
      {
        source: '/auth/signup',
        destination: '/auth/signin',
        permanent: false,
      },
      ...(!env.NEXT_PUBLIC_ENABLE_EUDR
        ? [
            {
              source: '/eudr',
              destination: '/analysis/map',
              permanent: false,
            },
          ]
        : []),
    ];
  },
};

export default nextConfig;
