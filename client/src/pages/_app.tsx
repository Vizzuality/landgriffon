import Head from 'next/head';
import { useMemo } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { OverlayProvider } from '@react-aria/overlays';
import { SSRProvider } from '@react-aria/ssr';
import { Hydrate } from 'react-query/hydration';
import { SessionProvider } from 'next-auth/react';
import initStore from 'store';

import type { AppProps } from 'next/app';

import 'styles/globals.css';
import type { NextPage } from 'next';

const queryClient = new QueryClient();

const MyApp: NextPage<AppProps> = ({ Component, pageProps }) => {
  const store = useMemo(() => initStore(pageProps.query), [pageProps.query]);
  return (
    <>
      <Head>
        <meta name="viewport" content="width=1024" />
      </Head>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <Hydrate state={pageProps.dehydratedState}>
            <SessionProvider session={pageProps.session}>
              <OverlayProvider>
                <SSRProvider>
                  <Component {...pageProps} />
                </SSRProvider>
              </OverlayProvider>
            </SessionProvider>
          </Hydrate>
        </QueryClientProvider>
      </ReduxProvider>
    </>
  );
};

export default MyApp;
