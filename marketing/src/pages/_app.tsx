import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { OverlayProvider } from '@react-aria/overlays';
import { SSRProvider } from '@react-aria/ssr';
import { Hydrate } from 'react-query/hydration';
import Script from 'next/script';

import store from 'store';
import ThirdParty from 'containers/third-party-cookies';
import { MediaContextProvider } from 'components/media-query';

import type { AppProps } from 'next/app';

import 'styles/globals.css';
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
              <ThirdParty />
              {/* Global site tag (gtag.js) - Google Analytics */}
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
                strategy="afterInteractive"
              />
              <Script id="google-analytics" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){window.dataLayer.push(arguments);}
                  gtag('js', new Date());

                  gtag('config', ${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS});
                `}
              </Script>
            </SSRProvider>
          </MediaContextProvider>
        </OverlayProvider>
      </Hydrate>
    </QueryClientProvider>
  </ReduxProvider>
);

export default MyApp;
