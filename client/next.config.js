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
    ];
  },
  env: {
    NEXT_PUBLIC_PLANET_API_KEY: 'PLAK6679039df83f414faf798ba4ad4530db',
    NEXT_PUBLIC_CARTO_FOREST_ACCESS_TOKEN:
      'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfemsydWhpaDYiLCJqdGkiOiJjY2JlMjUyYSJ9.LoqzuDp076ESVYmHm1mZNtfhnqOVGmSxzp60Fht8PQw',
    NEXT_PUBLIC_CARTO_DEFORESTATION_ACCESS_TOKEN:
      'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfemsydWhpaDYiLCJqdGkiOiJjZDk0ZWIyZSJ9.oqLagnOEc-j7Z4hY-MTP1yoZA_vJ7WYYAkOz_NUmCJo',
    NEXT_PUBLIC_CARTO_RADD_ACCESS_TOKEN:
      'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfemsydWhpaDYiLCJqdGkiOiI3NTFkNzA1YSJ9.jrVugV7HYfhmjxj-p2Iks8nL_AjHR91Q37JVP2fNmtc',
  },
};

module.exports = nextConfig;
