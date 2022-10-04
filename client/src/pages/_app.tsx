import Head from 'next/head';
import React, { useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider, Hydrate } from '@tanstack/react-query';
import { OverlayProvider } from '@react-aria/overlays';
import { SSRProvider } from '@react-aria/ssr';
import { SessionProvider } from 'next-auth/react';

import initStore from 'store';
import TitleTemplate from 'utils/titleTemplate';

import type { ReactElement, ReactNode } from 'react';
import type { AppProps } from 'next/app';
import type { NextPage } from 'next';
import type { DehydratedState } from '@tanstack/react-query';
import type { Session } from 'next-auth';

import 'styles/globals.css';

// eslint-disable-next-line @typescript-eslint/ban-types
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  Layout?: (page: ReactElement) => ReactNode;
};

type PageProps = {
  dehydratedState?: DehydratedState;
  session?: Session;
  query?: Record<string, string>; // TO-DO: better types
};

type AppPropsWithLayout = AppProps<PageProps> & {
  Component: NextPageWithLayout<PageProps>;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const [store] = useState(() => initStore(pageProps.query));
  const [queryClient] = useState(() => new QueryClient());
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
