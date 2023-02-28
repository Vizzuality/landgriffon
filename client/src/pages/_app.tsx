import Head from 'next/head';
import React, { useCallback, useEffect, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider, Hydrate } from '@tanstack/react-query';
import { OverlayProvider } from '@react-aria/overlays';
import { SSRProvider } from '@react-aria/ssr';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useDebounce } from 'rooks';

import initStore from 'store';
import TitleTemplate from 'utils/titleTemplate';

import type { ReactElement, ReactNode } from 'react';
import type { AppProps } from 'next/app';
import type { NextPage } from 'next';
import type { DehydratedState } from '@tanstack/react-query';
import type { Session } from 'next-auth';
import type { ParsedUrlQuery } from 'querystring';

import 'styles/globals.css';

// eslint-disable-next-line @typescript-eslint/ban-types
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  Layout?: (page: ReactElement) => ReactNode;
};

type PageProps = {
  dehydratedState?: DehydratedState;
  session?: Session;
  query?: ParsedUrlQuery;
};

type AppPropsWithLayout = AppProps<PageProps> & {
  Component: NextPageWithLayout<PageProps>;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  /*
   * On navigation, the redux middleware doesn't run, so we must manually trigger it.
   * The state is passed because otherwise it resets the store to the original state + the query params.
   */
  const router = useRouter();
  const [store, setStore] = useState(() => initStore(pageProps.query));

  const onRouteChange = useCallback(
    /**
     * @param href Relative URL being navigated to
     */
    (href: string) => {
      const pathname = href.split('?')[0];

      if (pathname === router.pathname) {
        // avoid redoing the store from scratch
        return;
      }

      setStore(initStore(router.query, store.getState()));
    },
    [router.pathname, router.query, store],
  );

  const debouncedRouteChange = useDebounce(onRouteChange, 500);

  useEffect(() => {
    router.events.on('routeChangeComplete', debouncedRouteChange);

    return () => {
      router.events.off('routeChangeComplete', debouncedRouteChange);
    };
  }, [debouncedRouteChange, router.events]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  const getLayout = Component.Layout ?? ((page) => page);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=1024" />
      </Head>
      <TitleTemplate titleTemplate="%s - LandGriffon" />
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <Hydrate state={pageProps.dehydratedState}>
            <SessionProvider session={pageProps.session}>
              <OverlayProvider>
                <SSRProvider>{getLayout(<Component {...pageProps} />)}</SSRProvider>
              </OverlayProvider>
            </SessionProvider>
          </Hydrate>
        </QueryClientProvider>
      </ReduxProvider>
    </>
  );
}

export default MyApp;
