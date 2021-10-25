import type { AppProps } from 'next/app';

import { MediaContextProvider } from 'containers/media';

import 'styles/tailwind.css';

const MyApp: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => (
  <MediaContextProvider>
    <Component {...pageProps} />
  </MediaContextProvider>
);

export default MyApp;
