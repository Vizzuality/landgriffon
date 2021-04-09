import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

import Logo from 'components/logo';

const Welcome: React.FC = () => {
  return (
    <div>
      <Head>
        <title>Landgriffon - Welcome to the marketing site</title>
      </Head>

      <header>
        <Link href="/">
          <a>
            <Logo />
          </a>
        </Link>
      </header>

      <main />

      <footer>
        <div>
          <img src="/EU-logo.png" alt="European Union Logo" />
          <p>
            This project has received funding from the
            European Union&apos;s Horizon 2020 research and
            innovation programme under grant agreement
            No 101004174
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
