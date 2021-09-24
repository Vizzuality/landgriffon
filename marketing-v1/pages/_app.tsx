import type { AppProps } from 'next/app';

import { OverlayProvider } from '@react-aria/overlays';
import { Provider as AuthenticationProvider } from 'next-auth/client';

import 'styles/tailwind.css';

const MyApp: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => (
  <AuthenticationProvider
    session={pageProps.session}
    options={{
      clientMaxAge: 5 * 60, // Re-fetch session if cache is older than 60 seconds
      keepAlive: 10 * 60, // Send keepAlive message every 10 minutes
    }}
  >
    <OverlayProvider>
      <Component {...pageProps} />
    </OverlayProvider>
  </AuthenticationProvider>
);

export default MyApp;
