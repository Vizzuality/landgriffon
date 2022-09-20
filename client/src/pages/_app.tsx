import Head from 'next/head';
import React, { useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider, Hydrate } from '@tanstack/react-query';
import { OverlayProvider } from '@react-aria/overlays';
import { SSRProvider } from '@react-aria/ssr';
import { SessionProvider } from 'next-auth/react';
import initStore from 'store';

import type { AppProps } from 'next/app';

import 'styles/globals.css';
import type { NextPage } from 'next';
import TitleTemplate from 'utils/titleTemplate';

export type Layout = React.FC<React.PropsWithChildren>;

// eslint-disable-next-line @typescript-eslint/ban-types
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  Layout?: Layout;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp: NextPage<AppPropsWithLayout> = ({ Component, pageProps }) => {
  const [store] = useState(() => initStore(pageProps.query));
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <Head>
        <meta name="viewport" content="width=1024" />
      </Head>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <TitleTemplate titleTemplate="%s - LandGriffon" />
          <Hydrate state={pageProps.dehydratedState}>
            <SessionProvider session={pageProps.session}>
              <OverlayProvider>
                <SSRProvider>
                  {Component.Layout ? (
                    <Component.Layout>
                      <Component {...pageProps} />
                    </Component.Layout>
                  ) : (
                    <Component {...pageProps} />
                  )}
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
