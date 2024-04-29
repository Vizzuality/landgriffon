import NextAuth, { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';

import { authService } from 'services/authentication';
import getUserFullName from 'utils/user-full-name';
import { User } from '@/types';

import type { NextAuthOptions } from 'next-auth';

export const options: NextAuthOptions = {
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
    maxAge: 12 * 60 * 60, // 12 hours
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
        const { username, password } = credentials;

        // Request to sign in
        const signInRequest = await authService.request<{
          user: User;
          accessToken: string;
        }>({
          url: '/sign-in',
          method: 'POST',
          data: { username, password },
          headers: { 'Content-Type': 'application/json' },
        });

        const { data, status } = signInRequest;

        if (data && status === 201) {
          return {
            ...data.user,
            name: getUserFullName(data.user),
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
        const { accessToken, ...rest } = user;
        newToken.accessToken = accessToken;
        newToken.user = rest;

        // If it's not expired, return the token,
        // if (Date.now() / 1000 + TIME_TO_REFRESH_TOKEN < (newToken?.exp as number)) {
        //   return newToken;
        // }

        // otherwise, refresh token
        // const refreshTokenRequest = await authService.request({
        //   url: '/refresh-token',
        //   method: 'POST',
        //   data: {},
        //   headers: {
        //     'Content-Type': 'application/json',
        //     Authorization: `Bearer ${newToken.accessToken}`,
        //   },
        // });

        // newToken.accessToken = refreshTokenRequest.data.accessToken;
      }

      return newToken;
    },

    // Extending session object
    session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user = token.user;
      return session;
    },
  },
};

export function auth(
  ...args:
    | [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, options);
}

export default NextAuth(options);
