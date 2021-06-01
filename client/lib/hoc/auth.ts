import type { NextPageContext } from 'next';
import { getSession } from 'next-auth/client';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';

import USERS from 'services/users';

type AuthProps = {
  // TO-DO: change to a better type definition using Next types
  redirect?: {
    destination: string
    permanent: boolean
  }
  props?: Record<string, unknown>
};

type AuthHOC = (context: NextPageContext, session?: unknown) => Promise<AuthProps>;

export function withProtection(getServerSidePropsFunc?: AuthHOC) {
  return async (context: NextPageContext): Promise<AuthProps> => {
    const session = await getSession(context);
    const { req } = context;

    if (!session) {
      return {
        redirect: {
          destination: `/auth/sign-in?callbackUrl=${req.url}`, // referer url, path from node
          permanent: false,
        },
      };
    }

    if (getServerSidePropsFunc) {
      const SSPF = await getServerSidePropsFunc(context, session);

      return {
        props: {
          session,
          ...SSPF.props,
        },
      };
    }

    return {
      props: {
        session,
      },
    };
  };
}

export function withUser(getServerSidePropsFunc?: AuthHOC) {
  return async (context: NextPageContext): Promise<AuthProps> => {
    const session = await getSession(context);

    if (!session) {
      if (getServerSidePropsFunc) {
        const SSPF = (await getServerSidePropsFunc(context)) || {};

        return {
          props: {
            ...SSPF.props,
          },
        };
      }

      return {
        props: {},
      };
    }

    const queryClient = new QueryClient();

    await queryClient.prefetchQuery('me', () => USERS.request({
      method: 'GET',
      url: '/me',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }).then((response) => response.data));

    if (getServerSidePropsFunc) {
      const SSPF = (await getServerSidePropsFunc(context)) || {};

      return {
        props: {
          session,
          dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
          ...SSPF.props,
        },
      };
    }

    return {
      props: {
        session,
        dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      },
    };
  };
}

export function withoutProtection(getServerSidePropsFunc?: AuthHOC) {
  return async (context: NextPageContext): Promise<AuthProps> => {
    const session = await getSession(context);

    if (session) {
      return {
        redirect: {
          destination: '/projects',
          permanent: false,
        },
      };
    }

    if (getServerSidePropsFunc) {
      const SSPF = await getServerSidePropsFunc(context);

      return {
        props: {
          ...SSPF.props,
        },
      };
    }

    return {
      props: {},
    };
  };
}
