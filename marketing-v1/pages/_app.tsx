import { useEffect } from 'react';

import { AppProps } from 'next/app';
import { useRouter } from 'next/router';

import { MediaContextProvider } from 'containers/media';

import { pageView } from 'lib/ga-events';

import 'styles/tailwind.css';

const MyApp: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      pageView(url);
    };

    // When the component is mounted, subscribe to router changes
    // and log those page views
    router.events.on('routeChangeComplete', handleRouteChange);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <MediaContextProvider>
      <Component {...pageProps} />
    </MediaContextProvider>
  );
};

export default MyApp;
