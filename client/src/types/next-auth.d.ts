import type { User as APIUser } from 'types';

// ? Extend next-auth Session and User to include accessToken
declare module 'next-auth' {
  interface Session {
    accessToken: string;
    user?: APIUser;
  }

  interface User extends APIUser {
    email: string;
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  // ? Returned by the `jwt` callback and `getToken`, when using JWT sessions
  interface JWT {
    accessToken?: string;
    user?: APIUser;
  }
}
