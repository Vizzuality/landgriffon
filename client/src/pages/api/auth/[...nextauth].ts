import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { authService } from 'services/authentication';

import type { NextAuthOptions } from 'next-auth';

type CustomCredentials = Credential & {
  password: string;
  username: string;
};

const options: NextAuthOptions = {
  /**
   * Defining custom pages
   * By default Next-Auth provides /api/auth/signin
   */
  pages: {
    error: '/auth/signin',
    signIn: '/auth/signin',
  },

  session: {
    strategy: 'jwt',
    maxAge: 2 * 60 * 60, // 2 hours
  },
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Landgriffon',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        username: { label: 'Email', type: 'email', placeholder: 'username@domain.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { username, password } = credentials as CustomCredentials;

        // Request to sign in
        const signInRequest = await authService.request({
          url: '/sign-in',
          method: 'POST',
          data: { username, password },
          headers: { 'Content-Type': 'application/json' },
        });

        const { data, status } = signInRequest;

        // Parsing session data
        if (data && status === 201) {
          return {
            ...data.user,
            name:
              data.displayName ||
              (data.user.fname && data.user.lname ? `${data.user.fname} ${data.user.lname}` : null),
            image: data.user.avatarDataUrl,
            accessToken: data.accessToken,
          };
        }

        return null;
      },
    }),
  ],

  callbacks: {
    // Assigning encoded token from API to token created in the session
    jwt({ token, user }) {
      const newToken = { ...token };

      if (user) {
        const { accessToken } = user;
        newToken.accessToken = accessToken as string;
      }

      return newToken;
    },

    // Extending session object
    session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
};

export default NextAuth(options);
