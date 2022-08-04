import withAuth from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/auth/sign-in' },
  callbacks: {
    authorized: ({ token, req }) => {
      if (req.nextUrl.pathname === '/landgriffon-logo-white.svg') {
        return true;
      }

      return !!token;
    },
  },
});
