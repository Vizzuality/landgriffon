export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/data/:path*', '/analysis/:path*', '/eudr/:path*', '/profile'],
};
