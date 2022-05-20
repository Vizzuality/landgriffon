import type { AppProps } from 'next/app';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { OverlayProvider } from '@react-aria/overlays';
import { SSRProvider } from '@react-aria/ssr';
import { Hydrate } from 'react-query/hydration';
import { SessionProvider } from 'next-auth/react';
import store from 'store';

import 'ka-table/style.css';
import 'styles/globals.css';

const queryClient = new QueryClient();

const MyApp: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => (
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
);

export default MyApp;
