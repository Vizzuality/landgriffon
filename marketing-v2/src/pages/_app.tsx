import type { AppProps } from 'next/app';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { OverlayProvider } from '@react-aria/overlays';
import { SSRProvider } from '@react-aria/ssr';
import { Hydrate } from 'react-query/hydration';
import store from 'store';
import { MediaContextProvider } from 'components/media-query';

import 'styles/globals.css';
import 'styles/fonts.css';
import 'styles/flicking.css';

const queryClient = new QueryClient();

const MyApp: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => (
  <ReduxProvider store={store}>
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <OverlayProvider>
          <MediaContextProvider>
            <SSRProvider>
              <Component {...pageProps} />
            </SSRProvider>
          </MediaContextProvider>
        </OverlayProvider>
      </Hydrate>
    </QueryClientProvider>
  </ReduxProvider>
);

export default MyApp;
