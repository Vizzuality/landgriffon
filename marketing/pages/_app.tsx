import React from 'react';
import type { AppProps } from 'next/app';
import 'tailwindcss/tailwind.css';
import '../styles/globals.css';

const App: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => {
  return (
    <Component {...pageProps} />
  );
};

export default App;
