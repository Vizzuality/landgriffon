import '../styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Context as ResponsiveContext } from 'react-responsive';

import type { AppProps } from 'next/app';

import 'styles/globals.css';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ResponsiveContext.Provider value={{ width: 1440 }}>
        <Component {...pageProps} />
      </ResponsiveContext.Provider>
    </QueryClientProvider>
  );
}
