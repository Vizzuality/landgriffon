import '../styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleAnalytics } from 'nextjs-google-analytics';

import type { AppProps } from 'next/app';

import 'styles/globals.css';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleAnalytics trackPageViews />
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
